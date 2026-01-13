import { Controller, Post, Body, UseGuards, Req, Logger } from '@nestjs/common';

import { AuthenticatedRequest } from 'src/engine/api/rest/types/authenticated-request';
import { JwtAuthGuard } from 'src/engine/guards/jwt-auth.guard';

import { AIChatService } from './ai-chat.service';
import { SendMessageDto } from './dtos/send-message.dto';

type AgentType =
  | 'orchestrator'
  | 'workflow'
  | 'data'
  | 'context'
  | 'content';

@Controller('rest/ai-chat')
@UseGuards(JwtAuthGuard)
export class AIChatController {
  private readonly logger = new Logger(AIChatController.name);

  constructor(private readonly aiChatService: AIChatService) {}

  @Post('message')
  async sendMessage(
    @Body() dto: SendMessageDto,
    @Req() request: AuthenticatedRequest,
  ) {
    this.logger.log(
      `[AI Chat] Received message from workspace: ${request.workspace.id}`,
    );

    const context = {
      messages: [],
      activeAgent: 'orchestrator' as AgentType,
      linkedEntity: dto.linkedEntity,
      workspaceId: request.workspace.id,
      userId: request.user?.id ?? 'anonymous',
    };

    return this.aiChatService.sendMessage(dto.content, context);
  }
}
