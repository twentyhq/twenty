import {
  Body,
  Controller,
  Headers,
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
import { writeSseEvent } from 'src/engine/api/mcp/utils/write-sse-event.util';
import { RestApiExceptionFilter } from 'src/engine/api/rest/rest-api-exception.filter';
import { FlatApiKey } from 'src/engine/core-modules/api-key/types/flat-api-key.type';
import { FlatWorkspace } from 'src/engine/core-modules/workspace/types/flat-workspace.type';
import { UserEntity } from 'src/engine/core-modules/user/user.entity';
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
    @AuthWorkspace() workspace: FlatWorkspace,
    @AuthApiKey() apiKey: FlatApiKey | undefined,
    @AuthUser({ allowUndefined: true }) user: UserEntity | undefined,
    @AuthUserWorkspaceId({ allowUndefined: true })
    userWorkspaceId: string | undefined,
    @Headers('accept') acceptHeader: string | undefined,
    @Res({ passthrough: true }) res: Response,
  ) {
    const authContext = {
      workspace,
      userId: user?.id,
      userWorkspaceId,
      apiKey,
    };

    // JSON-RPC notifications (no id) expect no response body regardless of Accept
    if (!isDefined(body.id)) {
      await this.mcpProtocolService.handleMCPCoreQuery(body, authContext);

      res.status(HttpStatus.ACCEPTED);

      return;
    }

    const clientAcceptsSse =
      isDefined(acceptHeader) &&
      acceptHeader
        .split(',')
        .some((type) => type.trim().startsWith('text/event-stream'));

    if (clientAcceptsSse) {
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');
      // Prevent browsers from MIME-sniffing the SSE stream as HTML
      res.setHeader('X-Content-Type-Options', 'nosniff');

      const sseWriter = (data: Record<string, unknown>) => {
        writeSseEvent(res, data);
      };

      const result = await this.mcpProtocolService.handleMCPCoreQuery(
        body,
        authContext,
        sseWriter,
      );

      if (isDefined(result)) {
        writeSseEvent(res, result);
      }

      res.end();

      return;
    }

    const result = await this.mcpProtocolService.handleMCPCoreQuery(
      body,
      authContext,
    );

    return result;
  }
}
