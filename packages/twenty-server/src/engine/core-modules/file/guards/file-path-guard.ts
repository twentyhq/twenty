import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';

import { fileFolderConfigs } from 'src/engine/core-modules/file/interfaces/file-folder.interface';

import { checkFileFolder } from 'src/engine/core-modules/file/file.utils';
import { JwtWrapperService } from 'src/engine/core-modules/jwt/services/jwt-wrapper.service';

@Injectable()
export class FilePathGuard implements CanActivate {
  constructor(private readonly jwtWrapperService: JwtWrapperService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const fileFolder = checkFileFolder(request.params[0]);
    const ignoreExpirationToken =
      fileFolderConfigs[fileFolder].ignoreExpirationToken;

    const query = request.query;

    if (!query || !query['token']) {
      return false;
    }

    try {
      const payload = await this.jwtWrapperService.verifyWorkspaceToken(
        query['token'],
        'FILE',
        ignoreExpirationToken ? { ignoreExpiration: true } : {},
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
