import {
  Controller,
  Post,
  Query,
  Req,
  Res,
  UseFilters,
  UseGuards,
} from '@nestjs/common';

import * as Sentry from '@sentry/node';
import { type Request, type Response } from 'express';
import { ApiPath } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { McpAuthGuard } from 'src/engine/api/mcp/guards/mcp-auth.guard';
import { parseMcpToolMode } from 'src/engine/api/mcp/utils/parse-mcp-tool-mode.util';
import { McpProtocolService } from 'src/engine/api/mcp/services/mcp-protocol.service';
import { type McpCoreQueryContext } from 'src/engine/api/mcp/types/mcp-core-query-context.type';
import { getMcpRequestLogFields } from 'src/engine/api/mcp/utils/get-mcp-request-log-fields.util';
import { buildMcpWebRequest } from 'src/engine/api/mcp/utils/build-mcp-web-request.util';
import { writeMcpWebResponse } from 'src/engine/api/mcp/utils/write-mcp-web-response.util';
import { RestApiExceptionFilter } from 'src/engine/api/rest/rest-api-exception.filter';
import { AuthRestApiExceptionFilter } from 'src/engine/core-modules/auth/filters/auth-rest-api-exception.filter';
import { buildWorkspaceAuthContextFromRequest } from 'src/engine/core-modules/auth/utils/build-workspace-auth-context-from-request.util';
import { FlatApiKey } from 'src/engine/core-modules/api-key/types/flat-api-key.type';
import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { FlatWorkspace } from 'src/engine/core-modules/workspace/types/flat-workspace.type';
import { UserEntity } from 'src/engine/core-modules/user/user.entity';
import { AuthApiKey } from 'src/engine/decorators/auth/auth-api-key.decorator';
import { AuthApplication } from 'src/engine/decorators/auth/auth-application.decorator';
import { AuthUserWorkspaceId } from 'src/engine/decorators/auth/auth-user-workspace-id.decorator';
import { AuthUser } from 'src/engine/decorators/auth/auth-user.decorator';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { WorkspaceNotSuspendedGuard } from 'src/engine/guards/workspace-not-suspended.guard';
import { AccessPolicyGuard } from 'src/engine/guards/access-policy.guard';

@Controller(ApiPath.Mcp)
@UseGuards(
  McpAuthGuard,
  AccessPolicyGuard({
    authPrincipals: {
      userSession: {
        standard: true,
        impersonated: true,
        playground: true,
        workspaceAgnostic: false,
      },
      apiKey: true,
      oauthClient: true,
      application: { withUser: true, withoutUser: true, withAgent: true },
    },
    requiredPermissionFlags: [],
  }),
  WorkspaceNotSuspendedGuard,
)
@UseFilters(RestApiExceptionFilter, AuthRestApiExceptionFilter)
export class McpCoreController {
  constructor(private readonly mcpProtocolService: McpProtocolService) {}

  @Post()
  async handleMcpCore(
    @AuthWorkspace() workspace: FlatWorkspace,
    @AuthApiKey() apiKey: FlatApiKey | undefined,
    @AuthUser({ allowUndefined: true }) user: UserEntity | undefined,
    @AuthUserWorkspaceId({ allowUndefined: true })
    userWorkspaceId: string | undefined,
    @AuthApplication({ allowUndefined: true })
    application: FlatApplication | undefined,
    @Req() request: Request,
    @Res() res: Response,
    @Query('mode') mode?: string,
  ): Promise<void> {
    const { method: mcpMethod, toolName: mcpToolName } = getMcpRequestLogFields(
      request.body,
    );

    request.mcpMethod = mcpMethod;
    request.mcpToolName = mcpToolName;

    Sentry.getActiveSpan()?.setAttributes({
      ...(isDefined(mcpMethod) && { 'mcp.method': mcpMethod }),
      ...(isDefined(mcpToolName) && { 'mcp.tool_name': mcpToolName }),
    });

    // The guard authenticates after WorkspaceAuthContextMiddleware has run, so the context is built here
    const queryContext: McpCoreQueryContext = {
      authContext: buildWorkspaceAuthContextFromRequest(request),
      workspace,
      userId: user?.id,
      userWorkspaceId,
      apiKey,
      application,
      agentId: request.agentId,
      toolMode: parseMcpToolMode(mode),
    };

    const abortController = new AbortController();

    res.on('close', () => abortController.abort());

    const response = await this.mcpProtocolService.handleRequest({
      request: buildMcpWebRequest({
        url: `${request.protocol}://${request.get('host')}${request.originalUrl}`,
        method: request.method,
        headers: request.headers,
        signal: abortController.signal,
      }),
      parsedBody: request.body,
      method: mcpMethod,
      context: queryContext,
    });

    await writeMcpWebResponse({
      response,
      res,
      isEventStreamAccepted:
        request.header('accept')?.includes('text/event-stream') ?? false,
    });
  }
}
