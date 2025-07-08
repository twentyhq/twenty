import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Res,
  UseFilters,
  UseGuards,
} from '@nestjs/common';

import { Response } from 'express';

import { RestApiExceptionFilter } from 'src/engine/api/rest/rest-api-exception.filter';
import { AuthUserWorkspaceId } from 'src/engine/decorators/auth/auth-user-workspace-id.decorator';
import { JwtAuthGuard } from 'src/engine/guards/jwt-auth.guard';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';

import { AgentChatService } from './agent-chat.service';
import { AgentStreamingService } from './agent-streaming.service';

@Controller('rest/agent-chat')
@UseGuards(JwtAuthGuard, WorkspaceAuthGuard)
@UseFilters(RestApiExceptionFilter)
export class AgentChatController {
  constructor(
    private readonly agentChatService: AgentChatService,
    private readonly agentStreamingService: AgentStreamingService,
  ) {}

  @Get('threads/:agentId')
  async getThreadsForAgent(
    @Param('agentId') agentId: string,
    @AuthUserWorkspaceId() userWorkspaceId: string,
  ) {
    return this.agentChatService.getThreadsForAgent(agentId, userWorkspaceId);
  }

  @Get('threads/:threadId/messages')
  async getMessagesForThread(
    @Param('threadId') threadId: string,
    @AuthUserWorkspaceId() userWorkspaceId: string,
  ) {
    return this.agentChatService.getMessagesForThread(
      threadId,
      userWorkspaceId,
    );
  }

  @Post('threads')
  async createThread(
    @Body() body: { agentId: string },
    @AuthUserWorkspaceId() userWorkspaceId: string,
  ) {
    return this.agentChatService.createThread(body.agentId, userWorkspaceId);
  }

  @Post('stream')
  async streamAgentChat(
    @Body()
    body: { threadId: string; userMessage: string },
    @AuthUserWorkspaceId() userWorkspaceId: string,
    @Res() res: Response,
  ) {
    await this.agentStreamingService.streamAgentChat({
      threadId: body.threadId,
      userMessage: body.userMessage,
      userWorkspaceId,
      res,
    });
  }
}
