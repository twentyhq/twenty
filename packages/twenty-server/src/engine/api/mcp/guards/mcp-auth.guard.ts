import {
  type CanActivate,
  type ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

import { type Request, type Response } from 'express';

import { ALL_OAUTH_SCOPES } from 'src/engine/core-modules/application/application-oauth/constants/oauth-scopes';
import { JwtAuthGuard } from 'src/engine/guards/jwt-auth.guard';

// RFC 9728 / MCP authorization spec: when the MCP endpoint returns 401,
// include a WWW-Authenticate header pointing to the path-aware Protected
// Resource Metadata URL so the client discovers the correct resource
// identifier. The `scope` parameter tells the client which scopes to request.
@Injectable()
export class McpAuthGuard implements CanActivate {
  constructor(private readonly jwtAuthGuard: JwtAuthGuard) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isAuthenticated = await this.jwtAuthGuard.canActivate(context);

    if (!isAuthenticated) {
      const request = context.switchToHttp().getRequest<Request>();
      const baseUrl = `${request.protocol}://${request.get('host')}`;
      const resourceMetadataUrl = `${baseUrl}/.well-known/oauth-protected-resource/mcp`;
      const scope = ALL_OAUTH_SCOPES.join(' ');

      // Set the header on the response before throwing, because exception
      // filters may not preserve custom headers from the exception payload.
      const response = context.switchToHttp().getResponse<Response>();

      response.setHeader(
        'WWW-Authenticate',
        `Bearer resource_metadata="${resourceMetadataUrl}", scope="${scope}"`,
      );

      throw new UnauthorizedException();
    }

    return true;
  }
}
