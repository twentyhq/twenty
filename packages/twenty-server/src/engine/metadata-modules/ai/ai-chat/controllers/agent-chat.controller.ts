import {
  Body,
  Controller,
  Post,
  Res,
  UseFilters,
  UseGuards,
} from '@nestjs/common';

import { Response } from 'express';
import { type ExtendedUIMessage } from 'twenty-shared/ai';
import { PermissionFlagType } from 'twenty-shared/constants';

import { RestApiExceptionFilter } from 'src/engine/api/rest/rest-api-exception.filter';
import { type WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthUserWorkspaceId } from 'src/engine/decorators/auth/auth-user-workspace-id.decorator';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { JwtAuthGuard } from 'src/engine/guards/jwt-auth.guard';
import { SettingsPermissionGuard } from 'src/engine/guards/settings-permission.guard';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { type BrowsingContextType } from 'src/engine/metadata-modules/ai/ai-agent/types/browsingContext.type';
import { AgentChatStreamingService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-streaming.service';

@Controller('rest/agent-chat')
@UseGuards(JwtAuthGuard, WorkspaceAuthGuard)
@UseFilters(RestApiExceptionFilter)
export class AgentChatController {
  constructor(
    private readonly agentStreamingService: AgentChatStreamingService,
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
