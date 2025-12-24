import {
  Body,
  Controller,
  Post,
  Res,
  UseFilters,
  UseGuards,
} from '@nestjs/common';

import { PermissionFlagType } from 'twenty-shared/constants';

import type { Response } from 'express';
import type { ExtendedUIMessage } from 'twenty-shared/ai';

import { RestApiExceptionFilter } from 'src/engine/api/rest/rest-api-exception.filter';
import {
  BillingException,
  BillingExceptionCode,
} from 'src/engine/core-modules/billing/billing.exception';
import { BillingProductKey } from 'src/engine/core-modules/billing/enums/billing-product-key.enum';
import { BillingRestApiExceptionFilter } from 'src/engine/core-modules/billing/filters/billing-api-exception.filter';
import { BillingService } from 'src/engine/core-modules/billing/services/billing.service';
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
import { AgentChatStreamingService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-streaming.service';
import { AiModelRegistryService } from 'src/engine/metadata-modules/ai/ai-models/services/ai-model-registry.service';

@Controller('rest/agent-chat')
@UseGuards(JwtAuthGuard, WorkspaceAuthGuard)
@UseFilters(
  AgentRestApiExceptionFilter,
  BillingRestApiExceptionFilter,
  RestApiExceptionFilter,
)
export class AgentChatController {
  constructor(
    private readonly agentStreamingService: AgentChatStreamingService,
    private readonly billingService: BillingService,
    private readonly twentyConfigService: TwentyConfigService,
    private readonly aiModelRegistryService: AiModelRegistryService,
  ) {}

  @Post('stream')
  @UseGuards(SettingsPermissionGuard(PermissionFlagType.AI))
  async streamAgentChat(
    @Body()
    body: {
      threadId: string;
      messages: ExtendedUIMessage[];
      browsingContext?: BrowsingContextType | null;
    },
    @AuthUserWorkspaceId() userWorkspaceId: string,
    @AuthWorkspace() workspace: WorkspaceEntity,
    @Res() response: Response,
  ) {
    const availableModels = this.aiModelRegistryService.getAvailableModels();

    if (availableModels.length === 0) {
      throw new AgentException(
        'No AI models are available. Please configure at least one AI provider API key (OPENAI_API_KEY, ANTHROPIC_API_KEY, or XAI_API_KEY).',
        AgentExceptionCode.API_KEY_NOT_CONFIGURED,
      );
    }

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

    this.agentStreamingService.streamAgentChat({
      threadId: body.threadId,
      messages: body.messages,
      browsingContext: body.browsingContext ?? null,
      userWorkspaceId,
      workspace,
      response,
    });
  }
}
