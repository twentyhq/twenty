import { Controller, Post, Req, UseGuards } from '@nestjs/common';

import { Request } from 'express';

import { MCPMetadataService } from 'src/engine/api/mcp/services/mcp-metadata.service';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { JwtAuthGuard } from 'src/engine/guards/jwt-auth.guard';
import { NoPermissionGuard } from 'src/engine/guards/no-permission.guard';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';

@Controller('mcp/metadata')
@UseGuards(JwtAuthGuard, WorkspaceAuthGuard, NoPermissionGuard)
export class McpMetadataController {
  constructor(private readonly mCPMetadataService: MCPMetadataService) {}

  @Post()
  async handleMcpMetadata(
    @AuthWorkspace() workspace: WorkspaceEntity,
    @Req() request: Request,
  ) {
    return await this.mCPMetadataService.handleMCPMetadataQuery(request, {
      workspace,
    });
  }
}
