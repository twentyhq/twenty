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

import { UIDataTypes, UIMessage, UITools } from 'ai';
import { Response } from 'express';

import { RestApiExceptionFilter } from 'src/engine/api/rest/rest-api-exception.filter';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthUserWorkspaceId } from 'src/engine/decorators/auth/auth-user-workspace-id.decorator';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { JwtAuthGuard } from 'src/engine/guards/jwt-auth.guard';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { type RecordIdsByObjectMetadataNameSingularType } from 'src/engine/metadata-modules/agent/types/recordIdsByObjectMetadataNameSingular.type';

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
    body: {
      threadId: string;
      messages: UIMessage<unknown, UIDataTypes, UITools>[];
      recordIdsByObjectMetadataNameSingular?: RecordIdsByObjectMetadataNameSingularType;
    },
    @AuthUserWorkspaceId() userWorkspaceId: string,
    @AuthWorkspace() workspace: Workspace,
    @Res() response: Response,
  ) {
    this.agentStreamingService.streamAgentChat({
      threadId: body.threadId,
      messages: body.messages,
      userWorkspaceId,
      workspace,
      recordIdsByObjectMetadataNameSingular:
        body.recordIdsByObjectMetadataNameSingular || [],
      response,
    });
  }
}
