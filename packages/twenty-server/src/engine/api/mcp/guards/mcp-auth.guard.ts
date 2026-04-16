import {
  type CanActivate,
  type ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

import { type Request, type Response } from 'express';

import { JwtAuthGuard } from 'src/engine/guards/jwt-auth.guard';

// RFC 9728: When the MCP endpoint returns 401, include a WWW-Authenticate
// header pointing to the Protected Resource Metadata URL on the same host
// the client connected to — otherwise discovery fails for any host other
// than SERVER_URL (app.twenty.com, workspace subdomains, custom domains).
@Injectable()
export class McpAuthGuard implements CanActivate {
  constructor(private readonly jwtAuthGuard: JwtAuthGuard) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isAuthenticated = await this.jwtAuthGuard.canActivate(context);

    if (!isAuthenticated) {
      const request = context.switchToHttp().getRequest<Request>();
      const baseUrl = `${request.protocol}://${request.get('host')}`;
      const resourceMetadataUrl = `${baseUrl}/.well-known/oauth-protected-resource`;

      // Set the header on the response before throwing, because exception
      // filters may not preserve custom headers from the exception payload.
      const response = context.switchToHttp().getResponse<Response>();

      response.setHeader(
        'WWW-Authenticate',
        `Bearer resource_metadata="${resourceMetadataUrl}"`,
      );

      throw new UnauthorizedException();
    }

    return true;
  }
}
