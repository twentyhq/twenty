import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

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
import { AppPath } from 'twenty-shared/types';
import { getAppPath } from 'twenty-shared/utils';
import { In, Repository } from 'typeorm';

import { getAllSelectableFields } from 'src/engine/api/utils/get-all-selectable-fields.utils';
import { buildCreatedByFromFullNameMetadata } from 'src/engine/core-modules/actor/utils/build-created-by-from-full-name-metadata.util';
import { AIBillingService } from 'src/engine/core-modules/ai/services/ai-billing.service';
import { AiModelRegistryService } from 'src/engine/core-modules/ai/services/ai-model-registry.service';
import { DomainManagerService } from 'src/engine/core-modules/domain-manager/services/domain-manager.service';
import { FileService } from 'src/engine/core-modules/file/services/file.service';
import { UserWorkspaceService } from 'src/engine/core-modules/user-workspace/user-workspace.service';
import { type Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { AgentHandoffToolService } from 'src/engine/metadata-modules/agent/agent-handoff-tool.service';
import { AGENT_CONFIG } from 'src/engine/metadata-modules/agent/constants/agent-config.const';
import { AGENT_SYSTEM_PROMPTS } from 'src/engine/metadata-modules/agent/constants/agent-system-prompts.const';
import { type RecordIdsByObjectMetadataNameSingularType } from 'src/engine/metadata-modules/agent/types/recordIdsByObjectMetadataNameSingular.type';
import { type ActorMetadata } from 'src/engine/metadata-modules/field-metadata/composite-types/actor.composite-type';
import { UserRoleService } from 'src/engine/metadata-modules/user-role/user-role.service';
import { getObjectMetadataMapItemByNameSingular } from 'src/engine/metadata-modules/utils/get-object-metadata-map-item-by-name-singular.util';
import { WorkspacePermissionsCacheService } from 'src/engine/metadata-modules/workspace-permissions-cache/workspace-permissions-cache.service';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';

import { AgentExecutionContext } from './agent-handoff-executor.service';
import { AgentModelConfigService } from './agent-model-config.service';
import { AgentToolGeneratorService } from './agent-tool-generator.service';
import { AgentEntity } from './agent.entity';
import { AgentException, AgentExceptionCode } from './agent.exception';

export interface AgentExecutionResult {
  result: object;
  usage: LanguageModelUsage;
}

@Injectable()
// eslint-disable-next-line @nx/workspace-inject-workspace-repository
export class AgentExecutionService implements AgentExecutionContext {
  private readonly logger = new Logger(AgentExecutionService.name);

  constructor(
    private readonly agentHandoffToolService: AgentHandoffToolService,
    private readonly fileService: FileService,
    private readonly domainManagerService: DomainManagerService,
    private readonly twentyORMGlobalManager: TwentyORMGlobalManager,
    private readonly workspacePermissionsCacheService: WorkspacePermissionsCacheService,
    private readonly aiModelRegistryService: AiModelRegistryService,
    private readonly agentToolGeneratorService: AgentToolGeneratorService,
    private readonly agentModelConfigService: AgentModelConfigService,
    private readonly aiBillingService: AIBillingService,
    private readonly userWorkspaceService: UserWorkspaceService,
    private readonly userRoleService: UserRoleService,
    @InjectRepository(AgentEntity)
    private readonly agentRepository: Repository<AgentEntity>,
  ) {}

  async prepareAIRequestConfig({
    messages,
    system,
    agent,
    actorContext,
    roleIdOverride,
    excludeHandoffTools = false,
  }: {
    system: string;
    agent: AgentEntity | null;
    messages: UIMessage<unknown, UIDataTypes, UITools>[];
    actorContext?: ActorMetadata;
    roleIdOverride?: string;
    excludeHandoffTools?: boolean;
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
            roleIdOverride,
          );

        let handoffTools = {};

        if (!excludeHandoffTools) {
          handoffTools =
            await this.agentHandoffToolService.generateHandoffTools(
              agent.id,
              agent.workspaceId,
              this, // Pass execution context
            );
        }

        const nativeModelTools =
          this.agentModelConfigService.getNativeModelTools(
            registeredModel,
            agent,
          );

        tools = { ...baseTools, ...handoffTools, ...nativeModelTools };

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
      };
    } catch (error) {
      this.logger.error(
        `Failed to prepare AI request config for agent ${agent?.id ?? 'no agent'}`,
        error instanceof Error ? error.stack : error,
      );
      throw error;
    }
  }

  private async getContextForSystemPrompt(
    workspace: Workspace,
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
              false,
              roleId,
            );

            const restrictedFields =
              objectMetadataPermissions?.[roleId]?.[objectMetadataMapItem.id]
                ?.restrictedFields ?? {};

            const hasRestrictedFields = Object.values(restrictedFields).some(
              (field) => field.canRead === false,
            );

            const selectOptions = hasRestrictedFields
              ? getAllSelectableFields({
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
                resourceUrl: this.domainManagerService.buildWorkspaceURL({
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
  }: {
    workspace: Workspace;
    userWorkspaceId: string;
    agentId: string;
    messages: UIMessage<unknown, UIDataTypes, UITools>[];
    recordIdsByObjectMetadataNameSingular: RecordIdsByObjectMetadataNameSingularType;
  }) {
    try {
      const agent = await this.agentRepository.findOneOrFail({
        where: { id: agentId },
      });

      let contextString = '';

      if (recordIdsByObjectMetadataNameSingular.length > 0) {
        const contextPart = await this.getContextForSystemPrompt(
          workspace,
          recordIdsByObjectMetadataNameSingular,
          userWorkspaceId,
        );

        contextString = `\n\nCONTEXT:\n${contextPart}`;
      }

      const { actor, roleId } = await this.buildUserContext(
        userWorkspaceId,
        workspace.id,
      );

      const aiRequestConfig = await this.prepareAIRequestConfig({
        system: `${AGENT_SYSTEM_PROMPTS.AGENT_CHAT}\n\n${agent.prompt}${contextString}`,
        agent,
        messages,
        actorContext: actor,
        roleIdOverride: roleId,
      });

      this.logger.log(
        `Sending request to AI model with ${messages.length} messages`,
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

      return stream;
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

  private async buildUserContext(
    userWorkspaceId: string,
    workspaceId: string,
  ): Promise<{ actor: ActorMetadata; roleId: string | undefined }> {
    const userWorkspace =
      await this.userWorkspaceService.findById(userWorkspaceId);

    if (!userWorkspace) {
      throw new AgentException(
        'User workspace not found',
        AgentExceptionCode.AGENT_EXECUTION_FAILED,
      );
    }

    const workspaceMemberRepository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace(
        workspaceId,
        'workspaceMember',
        { shouldBypassPermissionChecks: true },
      );

    const workspaceMember = await workspaceMemberRepository.findOne({
      where: {
        userId: userWorkspace.userId,
      },
    });

    if (!workspaceMember) {
      throw new AgentException(
        'Workspace member not found for user',
        AgentExceptionCode.AGENT_EXECUTION_FAILED,
      );
    }

    const roleId = await this.userRoleService.getRoleIdForUserWorkspace({
      userWorkspaceId,
      workspaceId,
    });

    const actor = buildCreatedByFromFullNameMetadata({
      fullNameMetadata: workspaceMember.name,
      workspaceMemberId: workspaceMember.id,
    });

    return { actor, roleId };
  }
}
