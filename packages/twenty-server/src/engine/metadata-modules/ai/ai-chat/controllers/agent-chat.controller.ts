import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Res,
  UseFilters,
  UseGuards,
} from '@nestjs/common';

import { PermissionFlagType } from 'twenty-shared/constants';

import { InjectRepository } from '@nestjs/typeorm';
import { UI_MESSAGE_STREAM_HEADERS } from 'ai';
import type { Response } from 'express';
import type { ExtendedUIMessage } from 'twenty-shared/ai';
import { isDefined } from 'twenty-shared/utils';
import type { Repository } from 'typeorm';

import { RestApiExceptionFilter } from 'src/engine/api/rest/rest-api-exception.filter';
import {
  BillingException,
  BillingExceptionCode,
} from 'src/engine/core-modules/billing/billing.exception';
import { BillingProductKey } from 'src/engine/core-modules/billing/enums/billing-product-key.enum';
import { BillingRestApiExceptionFilter } from 'src/engine/core-modules/billing/filters/billing-api-exception.filter';
import { BillingService } from 'src/engine/core-modules/billing/services/billing.service';
import { RedisClientService } from 'src/engine/core-modules/redis-client/redis-client.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import type { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthUserWorkspaceId } from 'src/engine/decorators/auth/auth-user-workspace-id.decorator';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { JwtAuthGuard } from 'src/engine/guards/jwt-auth.guard';
import { SettingsPermissionGuard } from 'src/engine/guards/settings-permission.guard';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import {
  AgentException,
  AgentExceptionCode,
} from 'src/engine/metadata-modules/ai/ai-agent/agent.exception';
import { AgentRestApiExceptionFilter } from 'src/engine/metadata-modules/ai/ai-agent/filters/agent-api-exception.filter';
import type { BrowsingContextType } from 'src/engine/metadata-modules/ai/ai-agent/types/browsingContext.type';
import { AgentChatThreadEntity } from 'src/engine/metadata-modules/ai/ai-chat/entities/agent-chat-thread.entity';
import { getCancelChannel } from 'src/engine/metadata-modules/ai/ai-chat/utils/get-cancel-channel.util';
import { AgentChatResumableStreamService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-resumable-stream.service';
import { AgentChatStreamingService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-streaming.service';
import { AiModelRegistryService } from 'src/engine/metadata-modules/ai/ai-models/services/ai-model-registry.service';

@Controller('rest/agent-chat')
@UseGuards(JwtAuthGuard, WorkspaceAuthGuard)
@UseFilters(
  RestApiExceptionFilter,
  AgentRestApiExceptionFilter,
  BillingRestApiExceptionFilter,
)
export class AgentChatController {
  constructor(
    private readonly agentStreamingService: AgentChatStreamingService,
    private readonly resumableStreamService: AgentChatResumableStreamService,
    private readonly billingService: BillingService,
    private readonly twentyConfigService: TwentyConfigService,
    private readonly aiModelRegistryService: AiModelRegistryService,
    private readonly redisClientService: RedisClientService,
    @InjectRepository(AgentChatThreadEntity)
    private readonly threadRepository: Repository<AgentChatThreadEntity>,
  ) {}

  @Post('stream')
  @UseGuards(SettingsPermissionGuard(PermissionFlagType.AI))
  async streamAgentChat(
    @Body()
    body: {
      threadId: string;
      messages: ExtendedUIMessage[];
      browsingContext?: BrowsingContextType | null;
      modelId?: string;
    },
    @AuthUserWorkspaceId() userWorkspaceId: string,
    @AuthWorkspace() workspace: WorkspaceEntity,
    @Res() response: Response,
  ) {
    if (this.aiModelRegistryService.getAvailableModels().length === 0) {
      throw new AgentException(
        'No AI models are available. Configure at least one AI provider.',
        AgentExceptionCode.API_KEY_NOT_CONFIGURED,
      );
    }

    const resolvedModelId = body.modelId ?? workspace.smartModel;

    this.aiModelRegistryService.validateModelAvailability(
      resolvedModelId,
      workspace,
    );

    if (this.twentyConfigService.get('IS_BILLING_ENABLED')) {
      const canBill = await this.billingService.canBillMeteredProduct(
        workspace.id,
        BillingProductKey.WORKFLOW_NODE_EXECUTION,
      );

      if (!canBill) {
        throw new BillingException(
          'Credits exhausted',
          BillingExceptionCode.BILLING_CREDITS_EXHAUSTED,
        );
      }
    }

    return this.agentStreamingService.streamAgentChat({
      threadId: body.threadId,
      messages: body.messages,
      browsingContext: body.browsingContext ?? null,
      modelId: body.modelId,
      userWorkspaceId,
      workspace,
      response,
    });
  }

  @Get(':threadId/stream')
  @UseGuards(SettingsPermissionGuard(PermissionFlagType.AI))
  async resumeAgentChatStream(
    @Param('threadId') threadId: string,
    @AuthUserWorkspaceId() userWorkspaceId: string,
    @Res() response: Response,
  ) {
    const thread = await this.threadRepository.findOne({
      where: { id: threadId, userWorkspaceId },
    });

    if (!isDefined(thread) || !isDefined(thread.activeStreamId)) {
      response.status(204).end();

      return;
    }

    const resumedNodeReadable =
      await this.resumableStreamService.resumeExistingStreamAsNodeReadable(
        thread.activeStreamId,
      );

    if (!isDefined(resumedNodeReadable)) {
      response.status(204).end();

      return;
    }

    response.writeHead(200, UI_MESSAGE_STREAM_HEADERS);
    resumedNodeReadable.pipe(response);
  }

  @Delete(':threadId/stream')
  @UseGuards(SettingsPermissionGuard(PermissionFlagType.AI))
  async stopAgentChatStream(
    @Param('threadId') threadId: string,
    @AuthUserWorkspaceId() userWorkspaceId: string,
  ) {
    const thread = await this.threadRepository.findOne({
      where: { id: threadId, userWorkspaceId },
    });

    if (!isDefined(thread) || !isDefined(thread.activeStreamId)) {
      return { success: true };
    }

    // Publish a cancel signal via Redis pub/sub. The BullMQ worker
    // processing this thread's stream subscribes to this channel and
    // will abort the LLM connection when the message arrives — stopping
    // token generation and billing immediately.
    const redis = this.redisClientService.getClient();

    await redis.publish(getCancelChannel(threadId), 'cancel');

    await this.threadRepository.update(
      { id: threadId, userWorkspaceId },
      { activeStreamId: null },
    );

    return { success: true };
  }
}
