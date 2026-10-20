import { Injectable } from '@nestjs/common';

import { type ToolSet } from 'ai';
import {
  ASK_QUESTION_TOOL_NAME,
  PROPOSE_TOOL_CALL_TOOL_NAME,
  type ProposeToolCallToolInput,
  REQUEST_FORM_TOOL_NAME,
  type ToolCategory,
} from 'twenty-shared/ai';

import { ToolRegistryService } from 'src/engine/core-modules/tool-provider/services/tool-registry.service';
import {
  createExecuteToolTool,
  createLearnToolsTool,
  createLoadSkillTool,
  EXECUTE_TOOL_TOOL_NAME,
  LEARN_TOOLS_TOOL_NAME,
  LOAD_SKILL_TOOL_NAME,
} from 'src/engine/core-modules/tool-provider/tools';
import { type ToolContext } from 'src/engine/core-modules/tool-provider/types/tool-context.type';
import { type ToolIndexEntry } from 'src/engine/core-modules/tool-provider/types/tool-index-entry.type';
import { buildToolNotAvailableOutput } from 'src/engine/core-modules/tool-provider/utils/build-tool-not-available-output.util';
import { resolveProposedToolCall } from 'src/engine/metadata-modules/ai/ai-agent-execution/pausing-tools/utils/resolve-proposed-tool-call.util';
import { createProposeToolCallTool } from 'src/engine/metadata-modules/ai/ai-agent-execution/tools/propose-tool-call.tool';
import { createAskQuestionTool } from 'src/engine/metadata-modules/ai/ai-chat/tools/ask-question.tool';
import { createRequestFormTool } from 'src/engine/metadata-modules/ai/ai-chat/tools/request-form.tool';
import { AiModelConfigService } from 'src/engine/metadata-modules/ai/ai-models/services/ai-model-config.service';
import { type RegisteredAiModel } from 'src/engine/metadata-modules/ai/ai-models/services/ai-model-registry.service';
import { type NativeModelToolOptions } from 'src/engine/metadata-modules/ai/ai-models/types/native-model-tool-options.type';
import { SkillService } from 'src/engine/metadata-modules/skill/skill.service';

export type AgentRegistryAccess =
  // the workspace assistant: every tool its member may use, checked against the registry on each call
  | {
      type: 'assistant';
      toolContext: ToolContext;
      excludedToolNames: ReadonlySet<string>;
      preloadedToolNames: string[];
    }
  // calls stay within the catalog shown when the turn started, so a tool added since is out of reach
  | {
      type: 'catalog';
      toolContext: ToolContext;
      categories: readonly ToolCategory[];
      excludedToolNames: readonly string[];
    }
  // an agent limited to the objects it was granted, whose few tools are sent with the turn
  | {
      type: 'granted';
      toolContext: ToolContext;
      agentRoleId: string;
      categories: readonly ToolCategory[];
      excludedToolNames: readonly string[];
    }
  | { type: 'none' };

export type AgentToolsetInput = {
  registryAccess: AgentRegistryAccess;
  registeredModel: RegisteredAiModel;
  nativeToolOptions: NativeModelToolOptions;
  canAskHumans: boolean;
  isWorkspaceSetupThread?: boolean;
  waitTools?: ToolSet;
  extraTools?: ToolSet;
};

export type AgentToolset = {
  tools: ToolSet;
  toolCatalog: ToolIndexEntry[];
  directToolNames: string[];
  offeredPausingToolNames: string[];
};

type RegistryToolset = {
  directTools: ToolSet;
  metaTools: ToolSet;
  toolCatalog: ToolIndexEntry[];
  isToolAllowed: (toolName: string) => boolean;
};

@Injectable()
export class AgentToolsetService {
  constructor(
    private readonly toolRegistry: ToolRegistryService,
    private readonly aiModelConfigService: AiModelConfigService,
    private readonly skillService: SkillService,
  ) {}

  async build({
    registryAccess,
    registeredModel,
    nativeToolOptions,
    canAskHumans,
    isWorkspaceSetupThread = false,
    waitTools = {},
    extraTools = {},
  }: AgentToolsetInput): Promise<AgentToolset> {
    const { directTools, metaTools, toolCatalog, isToolAllowed } =
      await this.buildRegistryToolset(registryAccess);

    const resolveProposal = async (
      input: ProposeToolCallToolInput,
      toolContext: ToolContext,
    ) =>
      resolveProposedToolCall({
        input,
        findTool: async (toolName) => {
          if (!isToolAllowed(toolName)) {
            return undefined;
          }

          return registryAccess.type === 'granted'
            ? this.toolRegistry.findCatalogEntry(toolName, toolContext)
            : toolCatalog.find((entry) => entry.name === toolName);
        },
        executeTool: async ({ toolName, args }) =>
          isToolAllowed(toolName)
            ? this.toolRegistry.resolveAndExecute(toolName, args, toolContext)
            : buildToolNotAvailableOutput(toolName),
      });

    const pausingTools: ToolSet = {
      ...waitTools,
      ...(canAskHumans
        ? {
            [ASK_QUESTION_TOOL_NAME]: createAskQuestionTool({
              isWorkspaceSetupThread,
            }),
            [REQUEST_FORM_TOOL_NAME]: createRequestFormTool(),
          }
        : {}),
      ...(canAskHumans && registryAccess.type !== 'none'
        ? {
            [PROPOSE_TOOL_CALL_TOOL_NAME]: createProposeToolCallTool({
              resolveProposal: (input) =>
                resolveProposal(input, registryAccess.toolContext),
            }),
          }
        : {}),
    };

    const sentTools: ToolSet = {
      ...directTools,
      ...this.aiModelConfigService.getNativeModelTools(
        registeredModel,
        nativeToolOptions,
      ),
      ...pausingTools,
      ...extraTools,
    };

    return {
      tools: { ...sentTools, ...metaTools },
      toolCatalog,
      directToolNames: Object.keys(sentTools),
      offeredPausingToolNames: Object.keys(pausingTools),
    };
  }

  private async buildRegistryToolset(
    registryAccess: AgentRegistryAccess,
  ): Promise<RegistryToolset> {
    if (registryAccess.type === 'none') {
      return {
        directTools: {},
        metaTools: {},
        toolCatalog: [],
        isToolAllowed: () => false,
      };
    }

    const { toolContext } = registryAccess;
    const { workspaceId, userId, userWorkspaceId, locale } = toolContext;

    switch (registryAccess.type) {
      case 'assistant': {
        const { excludedToolNames, preloadedToolNames } = registryAccess;
        const toolCatalog = await this.toolRegistry.buildToolIndex(
          workspaceId,
          {
            userId,
            userWorkspaceId,
            locale,
            excludeTools: new Set(excludedToolNames),
            rolePermissionConfig: toolContext.rolePermissionConfig,
            application: toolContext.application,
          },
        );
        const isToolAllowed = (toolName: string) =>
          !excludedToolNames.has(toolName);

        return {
          directTools: await this.toolRegistry.getToolsByName(
            preloadedToolNames,
            toolContext,
            { compactOutput: true, spillLargeOutput: true },
          ),
          metaTools: {
            ...this.buildMetaTools(toolContext, isToolAllowed),
            [LOAD_SKILL_TOOL_NAME]: createLoadSkillTool(
              (skillNames) =>
                this.skillService.findFlatSkillsByNames(
                  skillNames,
                  workspaceId,
                ),
              async () =>
                (await this.skillService.findAllFlatSkills(workspaceId)).map(
                  (skill) => skill.name,
                ),
            ),
          },
          toolCatalog,
          isToolAllowed,
        };
      }
      case 'catalog': {
        const toolCatalog = await this.toolRegistry.buildToolIndex(
          workspaceId,
          {
            userId,
            userWorkspaceId,
            rolePermissionConfig: toolContext.rolePermissionConfig,
            application: toolContext.application,
            categories: [...registryAccess.categories],
            excludeTools: new Set(registryAccess.excludedToolNames),
          },
        );
        const catalogToolNames = new Set(
          toolCatalog.map((entry) => entry.name),
        );
        const isToolAllowed = (toolName: string) =>
          catalogToolNames.has(toolName);

        return {
          directTools: {},
          metaTools: this.buildMetaTools(toolContext, isToolAllowed),
          toolCatalog,
          isToolAllowed,
        };
      }
      case 'granted': {
        const directTools = await this.toolRegistry.getToolsByCategories(
          {
            ...toolContext,
            explicitObjectGrantsRoleId: registryAccess.agentRoleId,
          },
          {
            categories: [...registryAccess.categories],
            excludeTools: new Set(registryAccess.excludedToolNames),
          },
        );
        // the context lacks the explicit grants the tools were built with, so calls stay within them
        const isToolAllowed = (toolName: string) =>
          Object.prototype.hasOwnProperty.call(directTools, toolName);

        return {
          directTools,
          metaTools: {},
          toolCatalog: [],
          isToolAllowed,
        };
      }
    }
  }

  private buildMetaTools(
    toolContext: ToolContext,
    isToolAllowed: (toolName: string) => boolean,
  ): ToolSet {
    return {
      [LEARN_TOOLS_TOOL_NAME]: createLearnToolsTool(
        this.toolRegistry,
        toolContext,
        { isToolAllowed, spillLargeOutput: true },
      ),
      [EXECUTE_TOOL_TOOL_NAME]: createExecuteToolTool(
        this.toolRegistry,
        toolContext,
        { isToolAllowed, compactOutput: true, spillLargeOutput: true },
      ),
    };
  }
}
