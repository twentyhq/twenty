import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { type Readable } from 'stream';

import {
  type CoreUserMessage,
  type FilePart,
  type ImagePart,
  LanguageModelUsage,
  type ModelMessage,
  streamText,
  ToolSet,
  type UserContent,
} from 'ai';
import { AppPath } from 'twenty-shared/types';
import { getAppPath } from 'twenty-shared/utils';
import { In, Repository } from 'typeorm';

import { AIBillingService } from 'src/engine/core-modules/ai/services/ai-billing.service';
import { AiModelRegistryService } from 'src/engine/core-modules/ai/services/ai-model-registry.service';
import { DomainManagerService } from 'src/engine/core-modules/domain-manager/services/domain-manager.service';
import { FileEntity } from 'src/engine/core-modules/file/entities/file.entity';
import { FileService } from 'src/engine/core-modules/file/services/file.service';
import { extractFolderPathAndFilename } from 'src/engine/core-modules/file/utils/extract-folderpath-and-filename.utils';
import { type Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import {
  type AgentChatMessageEntity,
  AgentChatMessageRole,
} from 'src/engine/metadata-modules/agent/agent-chat-message.entity';
import { AgentHandoffToolService } from 'src/engine/metadata-modules/agent/agent-handoff-tool.service';
import { AGENT_CONFIG } from 'src/engine/metadata-modules/agent/constants/agent-config.const';
import { AGENT_SYSTEM_PROMPTS } from 'src/engine/metadata-modules/agent/constants/agent-system-prompts.const';
import { type RecordIdsByObjectMetadataNameSingularType } from 'src/engine/metadata-modules/agent/types/recordIdsByObjectMetadataNameSingular.type';
import { constructAssistantMessageContentFromStream } from 'src/engine/metadata-modules/agent/utils/constructAssistantMessageContentFromStream';
import { WorkspacePermissionsCacheService } from 'src/engine/metadata-modules/workspace-permissions-cache/workspace-permissions-cache.service';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { streamToBuffer } from 'src/utils/stream-to-buffer';

import { AgentToolGeneratorService } from './agent-tool-generator.service';
import { AgentEntity } from './agent.entity';
import { AgentException, AgentExceptionCode } from './agent.exception';

export interface AgentExecutionResult {
  result: object;
  usage: LanguageModelUsage;
}

@Injectable()
export class AgentExecutionService {
  private readonly logger = new Logger(AgentExecutionService.name);

  constructor(
    private readonly agentHandoffToolService: AgentHandoffToolService,
    private readonly fileService: FileService,
    private readonly domainManagerService: DomainManagerService,
    private readonly twentyORMGlobalManager: TwentyORMGlobalManager,
    private readonly workspacePermissionsCacheService: WorkspacePermissionsCacheService,
    private readonly aiModelRegistryService: AiModelRegistryService,
    private readonly agentToolGeneratorService: AgentToolGeneratorService,
    private readonly aiBillingService: AIBillingService,
    @InjectRepository(AgentEntity)
    private readonly agentRepository: Repository<AgentEntity>,
    @InjectRepository(FileEntity)
    private readonly fileRepository: Repository<FileEntity>,
  ) {}

  async prepareAIRequestConfig({
    messages,
    system,
    agent,
  }: {
    system: string;
    agent: AgentEntity | null;
    messages: ModelMessage[];
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

      if (agent) {
        const baseTools =
          await this.agentToolGeneratorService.generateToolsForAgent(
            agent.id,
            agent.workspaceId,
          );

        const handoffTools =
          await this.agentHandoffToolService.generateHandoffTools(
            agent.id,
            agent.workspaceId,
          );

        tools = { ...baseTools, ...handoffTools };
      }

      this.logger.log(`Generated ${Object.keys(tools).length} tools for agent`);

      return {
        system,
        tools,
        model: registeredModel.model,
        messages,
        maxSteps: AGENT_CONFIG.MAX_STEPS,
        ...(registeredModel.doesSupportThinking && {
          providerOptions: {
            anthropic: {
              thinking: {
                type: 'enabled',
                budgetTokens: AGENT_CONFIG.REASONING_BUDGET_TOKENS,
              },
            },
          },
        }),
      };
    } catch (error) {
      this.logger.error(
        `Failed to prepare AI request config for agent ${agent?.id ?? 'no agent'}`,
        error instanceof Error ? error.stack : error,
      );
      throw error;
    }
  }

  private async buildUserMessageWithFiles(
    fileIds: string[],
  ): Promise<(ImagePart | FilePart)[]> {
    const files = await this.fileRepository.find({
      where: {
        id: In(fileIds),
      },
    });

    return await Promise.all(files.map((file) => this.createFilePart(file)));
  }

  private async buildUserMessage(
    userMessage: string,
    fileIds: string[],
  ): Promise<CoreUserMessage> {
    const content: Exclude<UserContent, string> = [
      {
        type: 'text',
        text: userMessage,
      },
    ];

    if (fileIds.length !== 0) {
      content.push(...(await this.buildUserMessageWithFiles(fileIds)));
    }

    return {
      role: AgentChatMessageRole.USER,
      content,
    };
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

    const contextObject = (
      await Promise.all(
        recordIdsByObjectMetadataNameSingular.map(
          async (recordsWithObjectMetadataNameSingular) => {
            if (recordsWithObjectMetadataNameSingular.recordIds.length === 0) {
              return [];
            }

            const repository = workspaceDataSource.getRepository(
              recordsWithObjectMetadataNameSingular.objectMetadataNameSingular,
              false,
              roleId,
            );

            return (
              await repository.find({
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

  private async createFilePart(
    file: FileEntity,
  ): Promise<ImagePart | FilePart> {
    const { folderPath, filename } = extractFolderPathAndFilename(
      file.fullPath,
    );
    const fileStream = await this.fileService.getFileStream(
      folderPath,
      filename,
      file.workspaceId,
    );
    const fileBuffer = await streamToBuffer(fileStream as Readable);

    if (file.type.startsWith('image')) {
      return {
        type: 'image',
        image: fileBuffer,
        mediaType: file.type,
      };
    } else {
      return {
        type: 'file',
        data: fileBuffer,
        mediaType: file.type,
      };
    }
  }

  private mapMessagesToCoreMessages(
    messages: AgentChatMessageEntity[],
  ): ModelMessage[] {
    return messages
      .map(({ role, streamData, content }) => {
        if (role === AgentChatMessageRole.USER) {
          return {
            role: 'user' as const,
            content,
          };
        } else {
          return {
            role: 'assistant' as const,
            content: constructAssistantMessageContentFromStream(
              streamData ?? '',
            ),
          };
        }
      })
      .filter((message) => message.content.length > 0);
  }

  async streamChatResponse({
    workspace,
    userWorkspaceId,
    agentId,
    userMessage,
    messages,
    fileIds,
    recordIdsByObjectMetadataNameSingular,
  }: {
    workspace: Workspace;
    userWorkspaceId: string;
    agentId: string;
    userMessage: string;
    messages: AgentChatMessageEntity[];
    fileIds: string[];
    recordIdsByObjectMetadataNameSingular: RecordIdsByObjectMetadataNameSingularType;
  }) {
    const agent = await this.agentRepository.findOneOrFail({
      where: { id: agentId },
    });

    const llmMessages: ModelMessage[] =
      this.mapMessagesToCoreMessages(messages);

    let contextString = '';

    if (recordIdsByObjectMetadataNameSingular.length > 0) {
      const contextPart = await this.getContextForSystemPrompt(
        workspace,
        recordIdsByObjectMetadataNameSingular,
        userWorkspaceId,
      );

      contextString = `\n\nCONTEXT:\n${contextPart}`;
    }

    const userMessageWithFiles = await this.buildUserMessage(
      userMessage,
      fileIds,
    );

    llmMessages.push(userMessageWithFiles);

    const aiRequestConfig = await this.prepareAIRequestConfig({
      system: `${AGENT_SYSTEM_PROMPTS.AGENT_CHAT}\n\n${agent.prompt}${contextString}`,
      agent,
      messages: llmMessages,
    });

    this.logger.log(
      `Sending request to AI model with ${llmMessages.length} messages`,
    );

    const model = await this.aiModelRegistryService.resolveModelForAgent(agent);

    const stream = streamText(aiRequestConfig);

    stream.usage.then((usage) => {
      this.aiBillingService.calculateAndBillUsage(
        model.modelId,
        usage,
        workspace.id,
      );
    });

    return stream;
  }
}
