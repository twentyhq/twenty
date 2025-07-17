import { Controller, Post, Req, UseGuards } from '@nestjs/common';

import { Request } from 'express';

import { JwtAuthGuard } from 'src/engine/guards/jwt-auth.guard';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { MCPMetadataService } from 'src/engine/api/mcp/services/mcp-metadata.service';

@Controller('mcp/metadata')
@UseGuards(JwtAuthGuard, WorkspaceAuthGuard)
export class McpMetadataController {
  constructor(private readonly mCPMetadataService: MCPMetadataService) {}

  @Post()
  async getMcpMetadata(
    @AuthWorkspace() workspace: Workspace,
    @Req() request: Request,
  ) {
    return await this.mCPMetadataService.handleMCPQuery(request, {
      workspace,
    });
  }
}
