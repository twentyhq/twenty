import { Injectable } from '@nestjs/common';

import { msg } from '@lingui/core/macro';

import { ApiPath, FileFolder } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { v4 } from 'uuid';

import { FileStorageService } from 'src/engine/core-modules/file-storage/services/file-storage.service';
import { validateFilePath } from 'src/engine/core-modules/file-storage/utils/validate-file-path.util';
import { FileUploadTargetDTO } from 'src/engine/core-modules/file/file-upload/dtos/file-upload-target.dto';
import {
  FileUploadException,
  FileUploadExceptionCode,
} from 'src/engine/core-modules/file/file-upload/file-upload.exception';
import { type BatchFileResult } from 'src/engine/core-modules/file/file-upload/types/batch-file-result.type';
import { buildPendingUploadResourcePath } from 'src/engine/core-modules/file/file-upload/utils/build-pending-upload-resource-path.util';
import { toBatchErrorMessage } from 'src/engine/core-modules/file/file-upload/utils/to-batch-error-message.util';
import { FileSettings } from 'src/engine/core-modules/file/types/file-settings.types';
import { FileUploadTokenJwtPayload } from 'src/engine/core-modules/auth/types/file-upload-token-jwt-payload.type';
import { JwtTokenTypeEnum } from 'src/engine/core-modules/auth/types/jwt-token-type.enum';
import { JwtWrapperService } from 'src/engine/core-modules/jwt/services/jwt-wrapper.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';

const DIRECT_UPLOAD_CONTENT_TYPE = 'application/octet-stream';

export type BatchUploadTargetRequest = {
  workspaceId: string;
  applicationUniversalIdentifier: string;
  applicationId?: string;
  fileFolder: FileFolder;
  resourcePath: string;
  size: number;
  settings: FileSettings;
};

@Injectable()
export class FileUploadTargetService {
  constructor(
    private readonly fileStorageService: FileStorageService,
    private readonly jwtWrapperService: JwtWrapperService,
    private readonly twentyConfigService: TwentyConfigService,
  ) {}

  async buildUploadTarget({
    workspaceId,
    fileId,
    fileFolder,
    applicationUniversalIdentifier,
    resourcePath,
    contentType,
    size,
  }: {
    workspaceId: string;
    fileId: string;
    fileFolder: FileFolder;
    applicationUniversalIdentifier: string;
    resourcePath: string;
    contentType: string;
    size: number;
  }): Promise<FileUploadTargetDTO> {
    const pendingResourcePath = buildPendingUploadResourcePath({
      fileId,
      resourcePath,
    });

    // The prefix is added after the final path has passed validation, so a
    // path close to the limit would only fail once the client tried to write.
    const pendingPathValidation = validateFilePath({
      resourcePath: pendingResourcePath,
      fileFolder,
    });

    if (!pendingPathValidation.isValid) {
      throw new FileUploadException(
        `Resource path "${resourcePath}" leaves no room for the pending upload prefix: ${pendingPathValidation.error}`,
        FileUploadExceptionCode.BAD_REQUEST,
        {
          userFriendlyMessage: msg`This file path is too long to upload.`,
        },
      );
    }

    const expiresInSeconds = this.twentyConfigService.get(
      'STORAGE_S3_PRESIGNED_URL_EXPIRES_IN',
    );
    const expiresAt = new Date(Date.now() + expiresInSeconds * 1000);

    const presignedUploadUrl =
      await this.fileStorageService.getPresignedUploadUrl({
        fileFolder,
        applicationUniversalIdentifier,
        workspaceId,
        resourcePath: pendingResourcePath,
        contentType,
        contentLength: size,
        expiresInSeconds,
      });

    if (isDefined(presignedUploadUrl)) {
      return {
        fileId,
        uploadUrl: presignedUploadUrl,
        contentType,
        expiresAt,
      };
    }

    const payload: FileUploadTokenJwtPayload = {
      workspaceId,
      fileId,
      sub: workspaceId,
      type: JwtTokenTypeEnum.FILE_UPLOAD,
    };

    const token = await this.jwtWrapperService.signAsyncOrThrow(payload, {
      expiresIn: expiresInSeconds,
    });

    const serverUrl = this.twentyConfigService.get('SERVER_URL');

    return {
      fileId,
      uploadUrl: `${serverUrl}/${ApiPath.FileUpload}/${fileId}?token=${token}`,
      contentType: DIRECT_UPLOAD_CONTENT_TYPE,
      expiresAt,
    };
  }

  async createUploadTargetsBatch(
    requests: BatchUploadTargetRequest[],
  ): Promise<BatchFileResult<FileUploadTargetDTO>[]> {
    return Promise.all(
      requests.map(async (request) => {
        try {
          const pendingFile = await this.fileStorageService.createPendingFile({
            fileFolder: request.fileFolder,
            applicationUniversalIdentifier:
              request.applicationUniversalIdentifier,
            applicationId: request.applicationId,
            workspaceId: request.workspaceId,
            resourcePath: request.resourcePath,
            fileId: v4(),
            size: request.size,
            mimeType: DIRECT_UPLOAD_CONTENT_TYPE,
            settings: request.settings,
          });

          const value = await this.buildUploadTarget({
            workspaceId: request.workspaceId,
            fileId: pendingFile.id,
            fileFolder: request.fileFolder,
            applicationUniversalIdentifier:
              request.applicationUniversalIdentifier,
            resourcePath: request.resourcePath,
            contentType: DIRECT_UPLOAD_CONTENT_TYPE,
            size: request.size,
          });

          return { success: true as const, value };
        } catch (error) {
          return { success: false as const, error: toBatchErrorMessage(error) };
        }
      }),
    );
  }
}
