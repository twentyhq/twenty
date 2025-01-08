import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';

import { JwtWrapperService } from 'src/engine/core-modules/jwt/services/jwt-wrapper.service';

@Injectable()
export class FilePathGuard implements CanActivate {
  constructor(private readonly jwtWrapperService: JwtWrapperService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const query = request.query;

    if (!query || !query['token']) {
      return false;
    }

    try {
      const payload = await this.jwtWrapperService.verifyWorkspaceToken(
        query['token'],
        'FILE',
      );

      if (!payload.workspaceId) {
        return false;
      }
    } catch (error) {
      return false;
    }

    const decodedPayload = await this.jwtWrapperService.decode(query['token'], {
      json: true,
    });

    const workspaceId = decodedPayload?.['workspaceId'];

    request.workspaceId = workspaceId;

    return true;
  }
}
