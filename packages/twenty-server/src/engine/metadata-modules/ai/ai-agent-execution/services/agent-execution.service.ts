import { Injectable, Logger } from '@nestjs/common';

import {
  convertToModelMessages,
  generateObject,
  generateText,
  jsonSchema,
  stepCountIs,
  streamText,
  ToolSet,
  UIDataTypes,
  UIMessage,
  UITools,
} from 'ai';
import { AppPath, type ActorMetadata } from 'twenty-shared/types';
import { getAppPath } from 'twenty-shared/utils';
import { In } from 'typeorm';

import { getAllSelectableColumnNames } from 'src/engine/api/utils/get-all-selectable-column-names.utils';
import { WorkspaceDomainsService } from 'src/engine/core-modules/domain/workspace-domains/services/workspace-domains.service';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AgentExecutionResult } from 'src/engine/metadata-modules/ai/ai-agent-execution/types/agent-execution-result.type';
import {
  AgentException,
  AgentExceptionCode,
} from 'src/engine/metadata-modules/ai/ai-agent/agent.exception';
import { AgentService } from 'src/engine/metadata-modules/ai/ai-agent/agent.service';
import { AGENT_CONFIG } from 'src/engine/metadata-modules/ai/ai-agent/constants/agent-config.const';
import { AGENT_SYSTEM_PROMPTS } from 'src/engine/metadata-modules/ai/ai-agent/constants/agent-system-prompts.const';
import { RecordIdsByObjectMetadataNameSingularType } from 'src/engine/metadata-modules/ai/ai-agent/types/recordIdsByObjectMetadataNameSingular.type';
import { repairToolCall } from 'src/engine/metadata-modules/ai/ai-agent/utils/repair-tool-call.util';
import { AIBillingService } from 'src/engine/metadata-modules/ai/ai-billing/services/ai-billing.service';
import { ToolHints } from 'src/engine/metadata-modules/ai/ai-chat-router/types/tool-hints.interface';
import { AI_TELEMETRY_CONFIG } from 'src/engine/metadata-modules/ai/ai-models/constants/ai-telemetry.const';
import { AiModelRegistryService } from 'src/engine/metadata-modules/ai/ai-models/services/ai-model-registry.service';
import { FlatAgentWithRoleId } from 'src/engine/metadata-modules/flat-agent/types/flat-agent.type';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

import { AgentActorContextService } from './agent-actor-context.service';
import { AgentModelConfigService } from './agent-model-config.service';
import { AgentToolGeneratorService } from './agent-tool-generator.service';

// Re-export for backward compatibility
export { type AgentExecutionResult } from 'src/engine/metadata-modules/ai/ai-agent-execution/types/agent-execution-result.type';

export interface StreamChatResponseResult {
  stream: ReturnType<typeof streamText>;
  timings: {
    contextBuildTimeMs: number;
    toolGenerationTimeMs: number;
    aiRequestPrepTimeMs: number;
    toolCount: number;
  };
}

@Injectable()
export class AgentExecutionService {
  private readonly logger = new Logger(AgentExecutionService.name);

  constructor(
    private readonly workspaceDomainsService: WorkspaceDomainsService,
    private readonly twentyORMGlobalManager: TwentyORMGlobalManager,
    private readonly aiModelRegistryService: AiModelRegistryService,
    private readonly agentToolGeneratorService: AgentToolGeneratorService,
    private readonly agentModelConfigService: AgentModelConfigService,
    private readonly aiBillingService: AIBillingService,
    private readonly agentActorContextService: AgentActorContextService,
    private readonly agentService: AgentService,
    private readonly workspaceCacheService: WorkspaceCacheService,
  ) {}

  async prepareAIRequestConfig({
    messages,
    system,
    agent,
    actorContext,
    roleIds,
    toolHints,
    additionalTools,
  }: {
    system: string;
    agent: FlatAgentWithRoleId | null;
    messages: UIMessage<unknown, UIDataTypes, UITools>[];
    actorContext?: ActorMetadata;
    roleIds?: string[];
    toolHints?: ToolHints;
    additionalTools?: ToolSet;
  }) {
    try {
      if (agent) {
        this.logger.log(
          `Preparing AI request config for agent ${agent.id} with model ${agent.modelId}`,
        );
      }

      const registeredModel =
        await this.aiModelRegistryService.resolveModelForAgent(agent);

      let tools: ToolSet = {};
      let providerOptions;

      if (agent) {
        const baseTools =
          await this.agentToolGeneratorService.generateToolsForAgent(
            agent.id,
            agent.workspaceId,
            actorContext,
            roleIds,
            toolHints,
          );

        const nativeModelTools =
          this.agentModelConfigService.getNativeModelTools(
            registeredModel,
            agent,
          );

        tools = {
          ...baseTools,
          ...nativeModelTools,
          ...(additionalTools || {}),
        };

        providerOptions = this.agentModelConfigService.getProviderOptions(
          registeredModel,
          agent,
        );
      }

      this.logger.log(
        `Generated ${Object.keys(tools).length} tools for agent (including ${Object.keys(additionalTools || {}).length} additional tools)`,
      );

      return {
        system,
        tools,
        model: registeredModel.model,
        messages: convertToModelMessages(messages),
        stopWhen: stepCountIs(AGENT_CONFIG.MAX_STEPS),
        providerOptions,
        experimental_telemetry: AI_TELEMETRY_CONFIG,
        experimental_repairToolCall: async ({
          toolCall,
          tools: toolsForRepair,
          inputSchema,
          error,
        }: {
          toolCall: {
            type: 'tool-call';
            toolCallId: string;
            toolName: string;
            input: string;
          };
          tools: Record<string, unknown>;
          inputSchema: (toolCall: { toolName: string }) => unknown;
          error: Error;
        }) => {
          return repairToolCall({
            toolCall,
            tools: toolsForRepair,
            inputSchema,
            error,
            model: registeredModel.model,
          });
        },
      };
    } catch (error) {
      this.logger.error(
        `Failed to prepare AI request config for agent ${agent?.id ?? 'no agent'}`,
        error instanceof Error ? error.stack : error,
      );
      throw error;
    }
  }

  async getContextForSystemPrompt(
    workspace: WorkspaceEntity,
    recordIdsByObjectMetadataNameSingular: RecordIdsByObjectMetadataNameSingularType,
    userWorkspaceId: string,
  ) {
    const { userWorkspaceRoleMap } =
      await this.workspaceCacheService.getOrRecompute(workspace.id, [
        'userWorkspaceRoleMap',
      ]);

    const roleId = userWorkspaceRoleMap[userWorkspaceId];

    if (!roleId) {
      throw new AgentException(
        'Failed to retrieve user role.',
        AgentExceptionCode.ROLE_NOT_FOUND,
      );
    }

    const workspaceDataSource =
      await this.twentyORMGlobalManager.getDataSourceForWorkspace({
        workspaceId: workspace.id,
      });

    const flatObjectMetadataMaps =
      workspaceDataSource.internalContext.flatObjectMetadataMaps;
    const flatFieldMetadataMaps =
      workspaceDataSource.internalContext.flatFieldMetadataMaps;
    const objectIdByNameSingular =
      workspaceDataSource.internalContext.objectIdByNameSingular;
    const objectMetadataPermissions = workspaceDataSource.permissionsPerRoleId;

    const contextObject = (
      await Promise.all(
        recordIdsByObjectMetadataNameSingular.map(
          async (recordsWithObjectMetadataNameSingular) => {
            if (recordsWithObjectMetadataNameSingular.recordIds.length === 0) {
              return [];
            }

            const objectMetadataId =
              objectIdByNameSingular[
                recordsWithObjectMetadataNameSingular.objectMetadataNameSingular
              ];
            const objectMetadataMapItem = objectMetadataId
              ? flatObjectMetadataMaps.byId[objectMetadataId]
              : undefined;

            if (!objectMetadataMapItem) {
              this.logger.warn(
                `Object metadata not found for ${recordsWithObjectMetadataNameSingular.objectMetadataNameSingular}`,
              );

              return [];
            }

            const repository = workspaceDataSource.getRepository(
              recordsWithObjectMetadataNameSingular.objectMetadataNameSingular,
              { unionOf: [roleId] },
            );

            const restrictedFields =
              objectMetadataPermissions?.[roleId]?.[objectMetadataMapItem.id]
                ?.restrictedFields ?? {};

            const hasRestrictedFields = Object.values(restrictedFields).some(
              (field) => field.canRead === false,
            );

            const selectOptions = hasRestrictedFields
              ? getAllSelectableColumnNames({
                  restrictedFields,
                  objectMetadata: {
                    objectMetadataMapItem,
                    flatFieldMetadataMaps,
                  },
                })
              : undefined;

            return (
              await repository.find({
                ...(selectOptions && { select: selectOptions }),
                where: {
                  id: In(recordsWithObjectMetadataNameSingular.recordIds),
                },
              })
            ).map((record) => {
              return {
                ...record,
                resourceUrl: this.workspaceDomainsService.buildWorkspaceURL({
                  workspace,
                  pathname: getAppPath(AppPath.RecordShowPage, {
                    objectNameSingular:
                      recordsWithObjectMetadataNameSingular.objectMetadataNameSingular,
                    objectRecordId: record.id,
                  }),
                }),
              };
            });
          },
        ),
      )
    ).flat(2);

    return JSON.stringify(contextObject);
  }

  async streamChatResponse({
    workspace,
    userWorkspaceId,
    agentId,
    messages,
    recordIdsByObjectMetadataNameSingular,
    toolHints,
    additionalTools,
  }: {
    workspace: WorkspaceEntity;
    userWorkspaceId: string;
    agentId: string;
    messages: UIMessage<unknown, UIDataTypes, UITools>[];
    recordIdsByObjectMetadataNameSingular: RecordIdsByObjectMetadataNameSingularType;
    toolHints?: ToolHints;
    additionalTools?: ToolSet;
  }): Promise<{
    stream: ReturnType<typeof streamText>;
    timings: {
      contextBuildTimeMs: number;
      toolGenerationTimeMs: number;
      aiRequestPrepTimeMs: number;
      toolCount: number;
    };
    contextInfo: {
      contextString: string;
      contextRecordCount: number;
      contextSizeBytes: number;
    };
  }> {
    try {
      const agent = await this.agentService.findOneAgentById({
        workspaceId: workspace.id,
        id: agentId,
      });

      const contextBuildStart = Date.now();
      let contextPart = '';
      let contextRecordCount = 0;

      if (recordIdsByObjectMetadataNameSingular.length > 0) {
        contextPart = await this.getContextForSystemPrompt(
          workspace,
          recordIdsByObjectMetadataNameSingular,
          userWorkspaceId,
        );

        try {
          const contextData = JSON.parse(contextPart);

          contextRecordCount = Array.isArray(contextData)
            ? contextData.length
            : 0;
        } catch (error) {
          this.logger.warn('Failed to parse context for record count:', error);
        }
      }

      const contextString = contextPart ? `\n\nCONTEXT:\n${contextPart}` : '';
      const contextBuildTime = Date.now() - contextBuildStart;

      const { actorContext, roleId } =
        await this.agentActorContextService.buildUserAndAgentActorContext(
          userWorkspaceId,
          workspace.id,
        );

      const aiRequestPrepStart = Date.now();

      const aiRequestConfig = await this.prepareAIRequestConfig({
        system: `${AGENT_SYSTEM_PROMPTS.BASE}\n${AGENT_SYSTEM_PROMPTS.CHAT_ADDITIONS}\n\n${agent.prompt}${contextString}`,
        agent,
        messages,
        actorContext,
        roleIds: [roleId, ...(agent?.roleId ? [agent?.roleId] : [])],
        toolHints,
        additionalTools,
      });

      const aiRequestPrepTime = Date.now() - aiRequestPrepStart;
      const toolCount = Object.keys(aiRequestConfig.tools || {}).length;
      const toolGenerationTime = aiRequestPrepTime;

      this.logger.log(
        `Sending request to AI model with ${messages.length} messages and ${toolCount} tools`,
      );

      const model =
        await this.aiModelRegistryService.resolveModelForAgent(agent);

      const stream = streamText(aiRequestConfig);

      stream.usage
        .then((usage) => {
          this.aiBillingService.calculateAndBillUsage(
            model.modelId,
            usage,
            workspace.id,
            agent.id,
          );
        })
        .catch((usageError) => {
          this.logger.error('Failed to get usage information:', usageError);
        });

      return {
        stream,
        timings: {
          contextBuildTimeMs: contextBuildTime,
          toolGenerationTimeMs: toolGenerationTime,
          aiRequestPrepTimeMs: aiRequestPrepTime,
          toolCount,
        },
        contextInfo: {
          contextString: contextPart,
          contextRecordCount,
          contextSizeBytes: contextPart
            ? Buffer.byteLength(contextPart, 'utf8')
            : 0,
        },
      };
    } catch (error) {
      this.logger.error('Error in streamChatResponse:', error);
      throw new AgentException(
        error instanceof Error
          ? error.message
          : 'Failed to stream chat response',
        AgentExceptionCode.AGENT_EXECUTION_FAILED,
      );
    }
  }

  async executeAgent({
    agentId,
    userPrompt,
    workspaceId,
  }: {
    workspaceId: string;
    agentId: string;
    userPrompt: string;
    actorContext?: ActorMetadata;
  }): Promise<AgentExecutionResult> {
    try {
      const agent = await this.agentService.findOneAgentById({
        workspaceId,
        id: agentId,
      });

      const registeredModel =
        await this.aiModelRegistryService.resolveModelForAgent(agent);

      let tools: ToolSet = {};

      if (agent) {
        const baseTools =
          await this.agentToolGeneratorService.generateToolsForAgent(
            agent.id,
            agent.workspaceId,
            undefined,
            agent.roleId ? [agent.roleId] : undefined,
          );

        const nativeModelTools =
          this.agentModelConfigService.getNativeModelTools(
            registeredModel,
            agent,
          );

        tools = { ...baseTools, ...nativeModelTools };
      }

      this.logger.log(`Generated ${Object.keys(tools).length} tools for agent`);

      const textResponse = await generateText({
        system: `${AGENT_SYSTEM_PROMPTS.BASE}\n${AGENT_SYSTEM_PROMPTS.WORKFLOW_ADDITIONS}\n\n${agent ? agent.prompt : ''}`,
        tools,
        model: registeredModel.model,
        prompt: userPrompt,
        stopWhen: stepCountIs(AGENT_CONFIG.MAX_STEPS),
        experimental_telemetry: AI_TELEMETRY_CONFIG,
      });

      const allToolCalls = textResponse.steps.flatMap(
        (step) => step.toolCalls || [],
      );
      const allToolResults = textResponse.steps.flatMap(
        (step) => step.toolResults || [],
      );

      const agentSchema =
        agent?.responseFormat?.type === 'json'
          ? agent.responseFormat.schema
          : undefined;

      if (!agentSchema) {
        return {
          result: { response: textResponse.text },
          toolCalls: allToolCalls,
          toolResults: allToolResults,
          usage: textResponse.usage,
        };
      }

      const output = await generateObject({
        system: AGENT_SYSTEM_PROMPTS.OUTPUT_GENERATOR,
        model: registeredModel.model,
        prompt: `Based on the following execution results, generate the structured output according to the schema:

                 Execution Results: ${textResponse.text}

                 Please generate the structured output based on the execution results and context above.`,
        schema: jsonSchema(agentSchema),
        experimental_telemetry: AI_TELEMETRY_CONFIG,
      });

      return {
        result: output.object as object,
        toolCalls: allToolCalls,
        toolResults: allToolResults,
        usage: {
          inputTokens:
            (textResponse.usage?.inputTokens ?? 0) +
            (output.usage?.inputTokens ?? 0),
          outputTokens:
            (textResponse.usage?.outputTokens ?? 0) +
            (output.usage?.outputTokens ?? 0),
          totalTokens:
            (textResponse.usage?.totalTokens ?? 0) +
            (output.usage?.totalTokens ?? 0),
        },
      };
    } catch (error) {
      if (error instanceof AgentException) {
        throw error;
      }
      throw new AgentException(
        error instanceof Error ? error.message : 'Agent execution failed',
        AgentExceptionCode.AGENT_EXECUTION_FAILED,
      );
    }
  }
}
