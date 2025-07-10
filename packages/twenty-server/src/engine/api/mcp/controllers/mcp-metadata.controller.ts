import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';

import { Request } from 'express';

import { JwtAuthGuard } from 'src/engine/guards/jwt-auth.guard';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthApiKey } from 'src/engine/decorators/auth/auth-api-key.decorator';
import { AuthUserWorkspaceId } from 'src/engine/decorators/auth/auth-user-workspace-id.decorator';
import { JsonRpc } from 'src/engine/core-modules/ai/dtos/json-rpc';
import { MCPMetadataService } from 'src/engine/api/mcp/services/mcp-metadata.service';

@Controller('mcp-metadata')
@UseGuards(JwtAuthGuard, WorkspaceAuthGuard)
export class McpMetadataController {
  constructor(private readonly mCPMetadataService: MCPMetadataService) {}

  @Post()
  async getMcpMetadata(
    @Body() body: JsonRpc,
    @AuthWorkspace() workspace: Workspace,
    @AuthApiKey() apiKey: string | undefined,
    @AuthUserWorkspaceId() userWorkspaceId: string | undefined,
    @Req() request: Request,
  ) {
    return await this.mCPMetadataService.executeTool(request, {
      workspace,
      apiKey,
      userWorkspaceId,
    });
  }
}
