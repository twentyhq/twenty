import {
  type CanActivate,
  type ExecutionContext,
  Injectable,
} from '@nestjs/common';

import { FileFolder } from 'twenty-shared/types';

import { fileFolderConfigs } from 'src/engine/core-modules/file/interfaces/file-folder.interface';

import { FilesFieldTokenJwtPayload } from 'src/engine/core-modules/auth/types/auth-context.type';
import { JwtWrapperService } from 'src/engine/core-modules/jwt/services/jwt-wrapper.service';

@Injectable()
export class FilesFieldGuard implements CanActivate {
  constructor(private readonly jwtWrapperService: JwtWrapperService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    const fileToken = request.query.token;
    const fileId = request.params.id;

    if (!fileToken) {
      return false;
    }

    try {
      const payload = await this.jwtWrapperService.verifyJwtToken(fileToken, {
        ignoreExpiration:
          fileFolderConfigs[FileFolder.FilesField].ignoreExpirationToken,
      });

      if (!payload.workspaceId) {
        return false;
      }
    } catch {
      return false;
    }

    const decodedPayload =
      this.jwtWrapperService.decode<FilesFieldTokenJwtPayload>(fileToken, {
        json: true,
      });

    request.workspaceId = decodedPayload.workspaceId;

    if (decodedPayload.fileId !== fileId) {
      return false;
    }

    return true;
  }
}
