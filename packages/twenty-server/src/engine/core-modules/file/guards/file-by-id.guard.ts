import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';

import { FileFolder } from 'twenty-shared/types';

import { fileFolderConfigs } from 'src/engine/core-modules/file/interfaces/file-folder.interface';

import { FileTokenJwtPayload } from 'src/engine/core-modules/auth/types/auth-context.type';
import { JwtWrapperService } from 'src/engine/core-modules/jwt/services/jwt-wrapper.service';

export const SUPPORTED_FILE_FOLDERS = [
  FileFolder.CorePicture,
  FileFolder.FilesField,
  FileFolder.Workflow,
] as const;

export type SupportedFileFolder = (typeof SUPPORTED_FILE_FOLDERS)[number];

@Injectable()
export class FileByIdGuard implements CanActivate {
  constructor(private readonly jwtWrapperService: JwtWrapperService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const fileId = request.params.id;
    const fileFolder = request.params.fileFolder as FileFolder;
    const fileToken = request.query.token;

    if (!this.isSupportedFileFolder(fileFolder)) {
      return false;
    }

    if (!fileToken) {
      return false;
    }

    try {
      const payload = await this.jwtWrapperService.verifyJwtToken(fileToken, {
        ignoreExpiration: fileFolderConfigs[fileFolder].ignoreExpirationToken,
      });

      if (!payload.workspaceId) {
        return false;
      }
    } catch {
      return false;
    }

    const decodedPayload = this.jwtWrapperService.decode<FileTokenJwtPayload>(
      fileToken,
      {
        json: true,
      },
    );

    request.workspaceId = decodedPayload.workspaceId;

    if (decodedPayload.fileId !== fileId) {
      return false;
    }

    return true;
  }

  private isSupportedFileFolder(
    fileFolder: string,
  ): fileFolder is SupportedFileFolder {
    return SUPPORTED_FILE_FOLDERS.includes(fileFolder as SupportedFileFolder);
  }
}
