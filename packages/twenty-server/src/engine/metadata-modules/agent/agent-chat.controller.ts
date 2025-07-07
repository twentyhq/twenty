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
  async getThreadsForAgent(@Param('agentId') agentId: string) {
    return this.agentChatService.getThreadsForAgent(agentId);
  }

  @Get('messages/:threadId')
  async getMessagesForThread(@Param('threadId') threadId: string) {
    return this.agentChatService.getMessagesForThread(threadId);
  }

  @Post('threads')
  async createThread(@Body() body: { agentId: string }) {
    return this.agentChatService.createThread(body.agentId);
  }

  @Post('stream')
  async streamAgentChat(
    @Body()
    body: { threadId: string; userMessage: string },
    @Res() res: Response,
  ) {
    await this.agentStreamingService.streamAgentChat({
      threadId: body.threadId,
      userMessage: body.userMessage,
      res,
    });
  }
}
