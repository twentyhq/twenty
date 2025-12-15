import {
  Body,
  Controller,
  Post,
  UseFilters,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';

import { JsonRpc } from 'src/engine/api/mcp/dtos/json-rpc';
import { McpProtocolService } from 'src/engine/api/mcp/services/mcp-protocol.service';
import { RestApiExceptionFilter } from 'src/engine/api/rest/rest-api-exception.filter';
import { ApiKeyEntity } from 'src/engine/core-modules/api-key/api-key.entity';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthApiKey } from 'src/engine/decorators/auth/auth-api-key.decorator';
import { AuthUserWorkspaceId } from 'src/engine/decorators/auth/auth-user-workspace-id.decorator';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { JwtAuthGuard } from 'src/engine/guards/jwt-auth.guard';
import { NoPermissionGuard } from 'src/engine/guards/no-permission.guard';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';

@Controller('mcp')
@UseGuards(JwtAuthGuard, WorkspaceAuthGuard, NoPermissionGuard)
@UseFilters(RestApiExceptionFilter)
export class McpCoreController {
  constructor(private readonly mcpProtocolService: McpProtocolService) {}

  @Post()
  @UsePipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  )
  async handleMcpCore(
    @Body() body: JsonRpc,
    @AuthWorkspace() workspace: WorkspaceEntity,
    @AuthApiKey() apiKey: ApiKeyEntity | undefined,
    @AuthUserWorkspaceId() userWorkspaceId: string | undefined,
  ) {
    return await this.mcpProtocolService.handleMCPCoreQuery(body, {
      workspace,
      userWorkspaceId,
      apiKey,
    });
  }
}
