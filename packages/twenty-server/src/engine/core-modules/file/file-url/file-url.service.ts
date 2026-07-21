import { Injectable } from '@nestjs/common';

import { FileFolder } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type FileOutput } from 'src/engine/api/common/common-args-processors/data-arg-processor/types/file-item.type';
import { FileTokenJwtPayload } from 'src/engine/core-modules/auth/types/file-token-jwt-payload.type';
import { JwtTokenTypeEnum } from 'src/engine/core-modules/auth/types/jwt-token-type.enum';
import { JwtWrapperService } from 'src/engine/core-modules/jwt/services/jwt-wrapper.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { type WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';

@Injectable()
export class FileUrlService {
  private readonly inflightFileUrlSignings = new Map<string, Promise<string>>();

  constructor(
    private readonly jwtWrapperService: JwtWrapperService,
    private readonly twentyConfigService: TwentyConfigService,
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
