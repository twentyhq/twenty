import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';

import { FileFolder } from 'twenty-shared/types';

import { fileFolderConfigs } from 'src/engine/core-modules/file/interfaces/file-folder.interface';

import { FileTokenJwtPayload } from 'src/engine/core-modules/auth/types/file-token-jwt-payload.type';
import { JwtWrapperService } from 'src/engine/core-modules/jwt/services/jwt-wrapper.service';
import { isWorkspaceSuspended } from 'src/engine/core-modules/workspace/utils/is-workspace-suspended.util';
import { CoreEntityCacheService } from 'src/engine/core-entity-cache/services/core-entity-cache.service';

export const SUPPORTED_FILE_FOLDERS = [
  FileFolder.CorePicture,
  FileFolder.FilesField,
  FileFolder.Workflow,
  FileFolder.AgentChat,
  FileFolder.EmailAttachment,
  FileFolder.EmailImage,
  FileFolder.AppTarball,
  FileFolder.Dpa,
] as const;

export type SupportedFileFolder = (typeof SUPPORTED_FILE_FOLDERS)[number];

const FILE_FOLDERS_SERVED_WHEN_SUSPENDED: SupportedFileFolder[] = [
  FileFolder.CorePicture,
];

@Injectable()
export class FileByIdGuard implements CanActivate {
  constructor(
    private readonly jwtWrapperService: JwtWrapperService,
    private readonly coreEntityCacheService: CoreEntityCacheService,
  ) {}

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

    return await this.isFileFolderServable(
      fileFolder,
      decodedPayload.workspaceId,
    );
  }

  private async isFileFolderServable(
    fileFolder: SupportedFileFolder,
    workspaceId: string,
  ): Promise<boolean> {
    if (FILE_FOLDERS_SERVED_WHEN_SUSPENDED.includes(fileFolder)) {
      return true;
    }

    const workspace = await this.coreEntityCacheService.get(
      'workspaceEntity',
      workspaceId,
    );

    return !isWorkspaceSuspended(workspace);
  }

  private isSupportedFileFolder(
    fileFolder: string,
  ): fileFolder is SupportedFileFolder {
    return SUPPORTED_FILE_FOLDERS.includes(fileFolder as SupportedFileFolder);
  }
}
