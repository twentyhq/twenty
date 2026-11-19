import { Injectable } from '@nestjs/common';

import { isNonEmptyString } from '@sniptt/guards';
import { FileFolder } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type FileOutput } from 'src/engine/api/common/common-args-processors/data-arg-processor/types/file-item.type';
import { CoreEntityCacheService } from 'src/engine/core-entity-cache/services/core-entity-cache.service';
import { FileTokenJwtPayload } from 'src/engine/core-modules/auth/types/file-token-jwt-payload.type';
import { JwtTokenTypeEnum } from 'src/engine/core-modules/auth/types/jwt-token-type.enum';
import { SUPPORTED_FILE_FOLDERS } from 'src/engine/core-modules/file/constants/supported-file-folders.constant';
import { fileFolderConfigs } from 'src/engine/core-modules/file/interfaces/file-folder.interface';
import { type SupportedFileFolder } from 'src/engine/core-modules/file/types/supported-file-folder.type';
import { JwtWrapperService } from 'src/engine/core-modules/jwt/services/jwt-wrapper.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { isWorkspaceSuspended } from 'src/engine/core-modules/workspace/utils/is-workspace-suspended.util';
import { type WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';

const FILE_FOLDERS_SERVED_WHEN_SUSPENDED: SupportedFileFolder[] = [
  FileFolder.CorePicture,
  FileFolder.WorkspaceDataExport,
];

@Injectable()
export class FileUrlService {
  private readonly inflightFileUrlSignings = new Map<string, Promise<string>>();

  constructor(
    private readonly jwtWrapperService: JwtWrapperService,
    private readonly twentyConfigService: TwentyConfigService,
    private readonly coreEntityCacheService: CoreEntityCacheService,
  ) {}

  async signWorkspaceLogoUrl(
    workspace: Pick<WorkspaceEntity, 'id' | 'logoFileId'>,
  ): Promise<string | null> {
    if (!isDefined(workspace.logoFileId)) {
      return null;
    }

    return this.signFileByIdUrl({
      fileId: workspace.logoFileId,
      workspaceId: workspace.id,
      fileFolder: FileFolder.CorePicture,
    });
  }

  async signFirstFilesFieldFileUrl({
    filesFieldValue,
    workspaceId,
  }: {
    filesFieldValue: FileOutput[] | null | undefined;
    workspaceId: string;
  }): Promise<string | null> {
    const firstFileId = filesFieldValue?.[0]?.fileId;

    if (!isDefined(firstFileId)) {
      return null;
    }

    return this.signFileByIdUrl({
      fileId: firstFileId,
      workspaceId,
      fileFolder: FileFolder.FilesField,
    });
  }

  async signFileByIdUrl({
    fileId,
    workspaceId,
    fileFolder,
  }: {
    fileId: string;
    workspaceId: string;
    fileFolder: FileFolder;
  }): Promise<string> {
    const signingCacheKey = `${workspaceId}:${fileFolder}:${fileId}`;
    const inflightSigning = this.inflightFileUrlSignings.get(signingCacheKey);

    if (isDefined(inflightSigning)) {
      return inflightSigning;
    }

    const signing = (async () => {
      try {
        return await this.buildSignedFileUrl({
          fileId,
          workspaceId,
          fileFolder,
        });
      } finally {
        this.inflightFileUrlSignings.delete(signingCacheKey);
      }
    })();

    this.inflightFileUrlSignings.set(signingCacheKey, signing);

    return signing;
  }

  async verifyFileToken({
    fileToken,
    fileId,
    fileFolder,
  }: {
    fileToken: string | null;
    fileId: string;
    fileFolder: string;
  }): Promise<string | null> {
    if (
      !this.isSupportedFileFolder(fileFolder) ||
      !isNonEmptyString(fileToken)
    ) {
      return null;
    }

    const payload: FileTokenJwtPayload | null = await this.jwtWrapperService
      .verifyJwtToken(fileToken, {
        ignoreExpiration: fileFolderConfigs[fileFolder].ignoreExpirationToken,
      })
      .catch(() => null);

    if (!isNonEmptyString(payload?.workspaceId) || payload.fileId !== fileId) {
      return null;
    }

    const isServable = await this.isFileFolderServable({
      fileFolder,
      workspaceId: payload.workspaceId,
    });

    return isServable ? payload.workspaceId : null;
  }

  async resolveSignedFileUrl({
    fileUrl,
    workspaceId,
  }: {
    fileUrl: string;
    workspaceId: string;
  }): Promise<{ fileId: string; fileFolder: FileFolder } | null> {
    const serverUrl = this.twentyConfigService.get('SERVER_URL');

    if (!fileUrl.startsWith(`${serverUrl}/file/`) || !URL.canParse(fileUrl)) {
      return null;
    }

    const { pathname, searchParams } = new URL(fileUrl);
    const [fileFolder, fileId] = pathname.split('/').slice(-2);

    if (!this.isSupportedFileFolder(fileFolder)) {
      return null;
    }

    const tokenWorkspaceId = await this.verifyFileToken({
      fileToken: searchParams.get('token'),
      fileId,
      fileFolder,
    });

    return tokenWorkspaceId === workspaceId ? { fileId, fileFolder } : null;
  }

  private isSupportedFileFolder(
    fileFolder: string,
  ): fileFolder is SupportedFileFolder {
    return SUPPORTED_FILE_FOLDERS.some(
      (supportedFileFolder) => supportedFileFolder === fileFolder,
    );
  }

  private async isFileFolderServable({
    fileFolder,
    workspaceId,
  }: {
    fileFolder: SupportedFileFolder;
    workspaceId: string;
  }): Promise<boolean> {
    if (FILE_FOLDERS_SERVED_WHEN_SUSPENDED.includes(fileFolder)) {
      return true;
    }

    const workspace = await this.coreEntityCacheService.get(
      'workspaceEntity',
      workspaceId,
    );

    return !isWorkspaceSuspended(workspace);
  }

  private async buildSignedFileUrl({
    fileId,
    workspaceId,
    fileFolder,
  }: {
    fileId: string;
    workspaceId: string;
    fileFolder: FileFolder;
  }): Promise<string> {
    const payload: FileTokenJwtPayload = {
      workspaceId,
      fileId,
      sub: workspaceId,
      type: JwtTokenTypeEnum.FILE,
    };

    const token = await this.jwtWrapperService.signAsyncOrThrow(payload, {
      expiresIn: this.twentyConfigService.get('FILE_TOKEN_EXPIRES_IN'),
    });

    const serverUrl = this.twentyConfigService.get('SERVER_URL');

    return `${serverUrl}/file/${fileFolder}/${fileId}?token=${token}`;
  }

  getLegacyWorkspaceMemberAvatarUrl({
    fileId,
    fileFolder,
  }: {
    fileId: string;
    fileFolder: FileFolder;
  }): string {
    const serverUrl = this.twentyConfigService.get('SERVER_URL');

    return `${serverUrl}/file/${fileFolder}/${fileId}`;
  }
}
