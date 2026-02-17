import { Injectable } from '@nestjs/common';

import { isNonEmptyString } from '@sniptt/guards';
import { FileFolder } from 'twenty-shared/types';
import { v4 } from 'uuid';

import { ApplicationService } from 'src/engine/core-modules/application/services/application.service';
import { FileStorageService } from 'src/engine/core-modules/file-storage/file-storage.service';
import { FileWithSignedUrlDto } from 'src/engine/core-modules/file/dtos/file-with-sign-url.dto';
import { FileUrlService } from 'src/engine/core-modules/file/file-url/file-url.service';
import { extractFileInfo } from 'src/engine/core-modules/file/utils/extract-file-info.utils';
import { sanitizeFile } from 'src/engine/core-modules/file/utils/sanitize-file.utils';

@Injectable()
export class FileWorkflowService {
  constructor(
    private readonly fileStorageService: FileStorageService,
    private readonly applicationService: ApplicationService,
    private readonly fileUrlService: FileUrlService,
  ) {}

  async uploadFile({
    file,
    filename,
    workspaceId,
  }: {
    file: Buffer;
    filename: string;
    workspaceId: string;
  }): Promise<FileWithSignedUrlDto> {
    const { mimeType, ext } = await extractFileInfo({
      file,
      filename,
    });

    const sanitizedFile = sanitizeFile({ file, ext, mimeType });

    const fileId = v4();
    const name = `${fileId}${isNonEmptyString(ext) ? `.${ext}` : ''}`;

    const { workspaceCustomFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        {
          workspaceId,
        },
      );

    const savedFile = await this.fileStorageService.writeFile({
      sourceFile: sanitizedFile,
      resourcePath: name,
      mimeType,
      fileFolder: FileFolder.Workflow,
      applicationUniversalIdentifier:
        workspaceCustomFlatApplication.universalIdentifier,
      workspaceId,
      fileId,
      settings: {
        isTemporaryFile: true,
        toDelete: false,
      },
    });

    return {
      ...savedFile,
      url: this.fileUrlService.signFileByIdUrl({
        fileId,
        workspaceId,
        fileFolder: FileFolder.Workflow,
      }),
    };
  }
}
