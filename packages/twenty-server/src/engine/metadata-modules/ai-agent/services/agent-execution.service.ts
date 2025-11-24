import { Injectable, Logger } from '@nestjs/common';

import {
  convertToModelMessages,
  LanguageModelUsage,
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
import { AI_TELEMETRY_CONFIG } from 'src/engine/metadata-modules/ai-models/constants/ai-telemetry.const';
import { AIBillingService } from 'src/engine/metadata-modules/ai-billing/services/ai-billing.service';
import { AiModelRegistryService } from 'src/engine/metadata-modules/ai-models/services/ai-model-registry.service';
import { WorkspaceDomainsService } from 'src/engine/core-modules/domain/workspace-domains/services/workspace-domains.service';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AgentService } from 'src/engine/metadata-modules/ai-agent/agent.service';
import { AGENT_CONFIG } from 'src/engine/metadata-modules/ai-agent/constants/agent-config.const';
import { AGENT_SYSTEM_PROMPTS } from 'src/engine/metadata-modules/ai-agent/constants/agent-system-prompts.const';
import { AgentActorContextService } from 'src/engine/metadata-modules/ai-agent/services/agent-actor-context.service';
import { type RecordIdsByObjectMetadataNameSingularType } from 'src/engine/metadata-modules/ai-agent/types/recordIdsByObjectMetadataNameSingular.type';
import { type ToolHints } from 'src/engine/metadata-modules/ai-router/types/tool-hints.interface';
import { getObjectMetadataMapItemByNameSingular } from 'src/engine/metadata-modules/utils/get-object-metadata-map-item-by-name-singular.util';
import { WorkspacePermissionsCacheService } from 'src/engine/metadata-modules/workspace-permissions-cache/workspace-permissions-cache.service';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { AgentEntity } from 'src/engine/metadata-modules/ai-agent/entities/agent.entity';
import {
  AgentException,
  AgentExceptionCode,
} from 'src/engine/metadata-modules/ai-agent/agent.exception';
import { repairToolCall } from 'src/engine/metadata-modules/ai-agent/utils/repair-tool-call.util';

import { AgentToolGeneratorService } from './agent-tool-generator.service';
import { AgentModelConfigService } from './agent-model-config.service';

export interface AgentExecutionResult {
  result: object;
  usage: LanguageModelUsage;
}

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
    private readonly workspacePermissionsCacheService: WorkspacePermissionsCacheService,
    private readonly aiModelRegistryService: AiModelRegistryService,
    private readonly agentToolGeneratorService: AgentToolGeneratorService,
    private readonly agentModelConfigService: AgentModelConfigService,
    private readonly aiBillingService: AIBillingService,
    public readonly agentActorContextService: AgentActorContextService,
    public readonly agentService: AgentService,
  ) {}

  async prepareAIRequestConfig({
    messages,
    system,
    agent,
    actorContext,
    roleIds,
    toolHints,
  }: {
    system: string;
    agent: AgentEntity | null;
    messages: UIMessage<unknown, UIDataTypes, UITools>[];
    actorContext?: ActorMetadata;
    roleIds?: string[];
    toolHints?: ToolHints;
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

        tools = { ...baseTools, ...nativeModelTools };

        providerOptions = this.agentModelConfigService.getProviderOptions(
          registeredModel,
          agent,
        );
      }

      this.logger.log(`Generated ${Object.keys(tools).length} tools for agent`);

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
    const roleId =
      await this.workspacePermissionsCacheService.getRoleIdFromUserWorkspaceId({
        workspaceId: workspace.id,
        userWorkspaceId,
      });

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

    const objectMetadataMaps =
      workspaceDataSource.internalContext.objectMetadataMaps;
    const objectMetadataPermissions = workspaceDataSource.permissionsPerRoleId;

    const contextObject = (
      await Promise.all(
        recordIdsByObjectMetadataNameSingular.map(
          async (recordsWithObjectMetadataNameSingular) => {
            if (recordsWithObjectMetadataNameSingular.recordIds.length === 0) {
              return [];
            }

            const objectMetadataMapItem =
              getObjectMetadataMapItemByNameSingular(
                objectMetadataMaps,
                recordsWithObjectMetadataNameSingular.objectMetadataNameSingular,
              );

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
                  objectMetadata: { objectMetadataMapItem },
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
  }: {
    workspace: WorkspaceEntity;
    userWorkspaceId: string;
    agentId: string;
    messages: UIMessage<unknown, UIDataTypes, UITools>[];
    recordIdsByObjectMetadataNameSingular: RecordIdsByObjectMetadataNameSingularType;
    toolHints?: ToolHints;
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
      const agent = await this.agentService.findOneAgent(workspace.id, {
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
}
