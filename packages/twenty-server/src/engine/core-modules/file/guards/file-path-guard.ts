import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';

import { fileFolderConfigs } from 'src/engine/core-modules/file/interfaces/file-folder.interface';

import { JwtWrapperService } from 'src/engine/core-modules/jwt/services/jwt-wrapper.service';
import { checkFileFolder } from 'src/engine/core-modules/file/file.utils';

@Injectable()
export class FilePathGuard implements CanActivate {
  constructor(private readonly jwtWrapperService: JwtWrapperService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const fileFolder = checkFileFolder(request.params[0]);
    const isFileFolderPublic = fileFolderConfigs[fileFolder].isPublic;

    const query = request.query;

    if (!query || !query['token']) {
      return false;
    }

    // Only verify workspace token if the file folder is not public.
    if (!isFileFolderPublic) {
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
    }

    const decodedPayload = await this.jwtWrapperService.decode(query['token'], {
      json: true,
    });

    const workspaceId = decodedPayload?.['workspaceId'];

    request.workspaceId = workspaceId;

    return true;
  }
}
