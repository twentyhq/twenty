import {
  Body,
  Controller,
  Post,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';

import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { AuthApiKey } from 'src/engine/decorators/auth/auth-api-key.decorator';
import { AuthUserWorkspaceId } from 'src/engine/decorators/auth/auth-user-workspace-id.decorator';
import { JsonRpc } from 'src/engine/core-modules/ai/dtos/json-rpc';
import { McpService } from 'src/engine/core-modules/ai/services/mcp.service';
import { JwtAuthGuard } from 'src/engine/guards/jwt-auth.guard';

@Controller('mcp')
@UseGuards(JwtAuthGuard, WorkspaceAuthGuard)
export class McpController {
  constructor(private readonly mcpService: McpService) {}

  @Post()
  @UsePipes(new ValidationPipe({ transform: true }))
  async executeMcpMethods(
    @Body() body: JsonRpc,
    @AuthWorkspace() workspace: Workspace,
    @AuthApiKey() apiKey: string | undefined,
    @AuthUserWorkspaceId() userWorkspaceId: string | undefined,
  ) {
    return this.mcpService.executeTool(body, {
      workspace,
      userWorkspaceId,
      apiKey,
    });
  }
}
