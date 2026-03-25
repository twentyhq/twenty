import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Res,
  UseFilters,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';

import { type Response } from 'express';
import { isDefined } from 'twenty-shared/utils';

import { JsonRpc } from 'src/engine/api/mcp/dtos/json-rpc';
import { McpAuthGuard } from 'src/engine/api/mcp/guards/mcp-auth.guard';
import { McpProtocolService } from 'src/engine/api/mcp/services/mcp-protocol.service';
import { RestApiExceptionFilter } from 'src/engine/api/rest/rest-api-exception.filter';
import { ApiKeyEntity } from 'src/engine/core-modules/api-key/api-key.entity';
import { UserEntity } from 'src/engine/core-modules/user/user.entity';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthApiKey } from 'src/engine/decorators/auth/auth-api-key.decorator';
import { AuthUserWorkspaceId } from 'src/engine/decorators/auth/auth-user-workspace-id.decorator';
import { AuthUser } from 'src/engine/decorators/auth/auth-user.decorator';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { NoPermissionGuard } from 'src/engine/guards/no-permission.guard';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';

@Controller('mcp')
@UseGuards(McpAuthGuard, WorkspaceAuthGuard, NoPermissionGuard)
@UseFilters(RestApiExceptionFilter)
export class McpCoreController {
  constructor(private readonly mcpProtocolService: McpProtocolService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
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
    @AuthUser({ allowUndefined: true }) user: UserEntity | undefined,
    @AuthUserWorkspaceId({ allowUndefined: true })
    userWorkspaceId: string | undefined,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.mcpProtocolService.handleMCPCoreQuery(body, {
      workspace,
      userId: user?.id,
      userWorkspaceId,
      apiKey,
    });

    // JSON-RPC notifications (no id) expect no response body
    if (!isDefined(result)) {
      res.status(HttpStatus.ACCEPTED);

      return;
    }

    return result;
  }
}
