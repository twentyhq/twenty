import {
  type CanActivate,
  type ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

import { type Response } from 'express';

import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { JwtAuthGuard } from 'src/engine/guards/jwt-auth.guard';

// RFC 9728: When the MCP endpoint returns 401, include a WWW-Authenticate
// header pointing to the Protected Resource Metadata URL.
@Injectable()
export class McpAuthGuard implements CanActivate {
  constructor(
    private readonly jwtAuthGuard: JwtAuthGuard,
    private readonly twentyConfigService: TwentyConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isAuthenticated = await this.jwtAuthGuard.canActivate(context);

    if (!isAuthenticated) {
      const serverUrl = this.twentyConfigService.get('SERVER_URL');
      const resourceMetadataUrl = `${serverUrl}/.well-known/oauth-protected-resource`;

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
