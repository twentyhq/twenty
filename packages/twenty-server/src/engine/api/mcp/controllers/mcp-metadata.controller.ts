import { Controller, Get, UseGuards } from '@nestjs/common';

import { JwtAuthGuard } from 'src/engine/guards/jwt-auth.guard';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthApiKey } from 'src/engine/decorators/auth/auth-api-key.decorator';
import { AuthUserWorkspaceId } from 'src/engine/decorators/auth/auth-user-workspace-id.decorator';
import { McpService } from 'src/engine/core-modules/ai/services/mcp.service';
import { ToolService } from 'src/engine/core-modules/ai/services/tool.service';
import { wrapJsonRpcResponse } from 'src/engine/core-modules/ai/utils/wrap-jsonrpc-response';
import { toolRegistry } from '../decorators/tool.decorator';


@Controller('mcp-metadata')
@UseGuards(JwtAuthGuard, WorkspaceAuthGuard)
export class McpMetadataController {
  constructor(
    private readonly mcpService: McpService,
    private readonly toolService: ToolService,
  ) {}

  /**
   * Returns a list of all methods annotated with @Tool decorator
   * and dynamically generated tools based on object metadata and permissions
   */
  @Get()
  async getMcpMetadata(
    @AuthWorkspace() workspace: Workspace,
    @AuthApiKey() apiKey: string | undefined,
    @AuthUserWorkspaceId() userWorkspaceId: string | undefined,
  ) {
    return wrapJsonRpcResponse(null, {
      result: {
        capabilities: {
          tools: { listChanged: false },
        },
        // All tools in the required format
        tools: toolRegistry,
      },
    });
  }
}
