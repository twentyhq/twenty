import {
  Controller,
  Get,
  Logger,
  Param,
  Req,
  Res,
  UseFilters,
  UseGuards,
} from '@nestjs/common';

import { pipeline } from 'node:stream/promises';
import { join } from 'path';
import { type Readable } from 'stream';

import { Request, Response } from 'express';
import { ApiPath, FileFolder, ServerFileFolder } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import {
  FileStorageException,
  FileStorageExceptionCode,
} from 'src/engine/core-modules/file-storage/interfaces/file-storage-exception';
import { ServerFileStorageService } from 'src/engine/core-modules/file-storage/services/server-file-storage.service';
import { validateFilePath } from 'src/engine/core-modules/file-storage/utils/validate-file-path.util';
import {
  FileException,
  FileExceptionCode,
} from 'src/engine/core-modules/file/file.exception';
import { PUBLIC_ASSET_CACHE_CONTROL } from 'src/engine/core-modules/file/interfaces/file-folder.interface';
import { FileApiExceptionFilter } from 'src/engine/core-modules/file/filters/file-api-exception.filter';
import {
  FileByIdGuard,
  SupportedFileFolder,
} from 'src/engine/core-modules/file/guards/file-by-id.guard';
import { FileService } from 'src/engine/core-modules/file/services/file.service';
import { setFileResponseHeaders } from 'src/engine/core-modules/file/utils/set-file-response-headers.utils';
import { NoPermissionGuard } from 'src/engine/guards/no-permission.guard';
import { PublicEndpointGuard } from 'src/engine/guards/public-endpoint.guard';

// workspaceId is bound onto the request by FileByIdGuard.
type FileByIdRequest = Request & { workspaceId: string };

@Controller()
@UseFilters(FileApiExceptionFilter)
export class FileController {
  private readonly logger = new Logger(FileController.name);

  constructor(
    private readonly fileService: FileService,
    private readonly serverFileStorageService: ServerFileStorageService,
  ) {}

  // Serves application registration assets (logo, gallery images) by their
  // public folder path. These are instance-global marketplace resources, also
  // displayed on the public OAuth authorize page, hence no auth token, unlike
  // the workspace-scoped /file/:folder/:id.
  @Get(
    `${ApiPath.Files}/application-registrations/:applicationRegistrationId/*path`,
  )
  @UseGuards(PublicEndpointGuard, NoPermissionGuard)
  async getApplicationRegistrationAsset(
    @Res() res: Response,
    @Req() req: Request,
    @Param('applicationRegistrationId') applicationRegistrationId: string,
  ) {
    const filepath = join(...req.params.path);

    let fileResponse: { stream: Readable; mimeType: string };

    try {
      fileResponse = await this.serverFileStorageService.readServerFile({
        fileFolder: ServerFileFolder.ApplicationRegistration,
        applicationRegistrationId,
        resourcePath: filepath,
      });
    } catch (error) {
      if (
        error instanceof FileStorageException &&
        (error.code === FileStorageExceptionCode.FILE_NOT_FOUND ||
          error.code === FileStorageExceptionCode.ACCESS_DENIED)
      ) {
        throw new FileException(
          'File not found',
          FileExceptionCode.FILE_NOT_FOUND,
        );
      }

      this.logger.error('readServerFile failed unexpectedly', { error });

      throw new FileException(
        'Error retrieving file',
        FileExceptionCode.INTERNAL_SERVER_ERROR,
      );
    }

    setFileResponseHeaders(res, fileResponse.mimeType);
    res.setHeader('Cache-Control', PUBLIC_ASSET_CACHE_CONTROL);

    try {
      await pipeline(fileResponse.stream, res);
    } catch (error) {
      this.logger.error(
        'Application registration file stream failed mid-transfer',
        { error },
      );

      if (!res.headersSent) {
        throw new FileException(
          'Error streaming file from storage',
          FileExceptionCode.INTERNAL_SERVER_ERROR,
        );
      }

      res.destroy();
    }
  }

  @Get(`${ApiPath.PublicAssets}/:workspaceId/:applicationId/*path`)
  @UseGuards(PublicEndpointGuard, NoPermissionGuard)
  async getPublicAssets(
    @Res() res: Response,
    @Req() req: Request,
    @Param('workspaceId') workspaceId: string,
    @Param('applicationId')
    applicationId: string,
  ) {
    const filepath = join(...req.params.path);

    const filePathValidationResult = validateFilePath({
      resourcePath: filepath,
      fileFolder: FileFolder.PublicAsset,
    });

    if (!filePathValidationResult.isValid) {
      throw new FileException(
        'File not found',
        FileExceptionCode.FILE_NOT_FOUND,
      );
    }

    const fileResponse = await this.fileService
      .getFilePresignedUrlOrStreamByPath({
        workspaceId,
        applicationId,
        fileFolder: FileFolder.PublicAsset,
        filepath,
      })
      .catch((error) => {
        this.logger.error(
          'getFilePresignedUrlOrStreamByPath failed unexpectedly',
          {
            error,
          },
        );

        throw new FileException(
          'Error retrieving file',
          FileExceptionCode.INTERNAL_SERVER_ERROR,
        );
      });

    if (fileResponse === null) {
      throw new FileException(
        'File not found',
        FileExceptionCode.FILE_NOT_FOUND,
      );
    }

    if (fileResponse.type === 'redirect') {
      return res.redirect(fileResponse.presignedUrl);
    }

    setFileResponseHeaders(res, fileResponse.mimeType, FileFolder.PublicAsset);

    try {
      await pipeline(fileResponse.stream, res);
    } catch (error) {
      this.logger.error('Public asset stream failed mid-transfer', { error });

      if (!res.headersSent) {
        throw new FileException(
          'Error streaming file from storage',
          FileExceptionCode.INTERNAL_SERVER_ERROR,
        );
      }

      res.destroy();
    }
  }

  @Get(`${ApiPath.File}/:fileFolder/:id`)
  @UseGuards(FileByIdGuard, NoPermissionGuard)
  async getFileById(
    @Res() res: Response,
    @Req() req: FileByIdRequest,
    @Param('fileFolder') fileFolder: SupportedFileFolder,
    @Param('id') fileId: string,
  ) {
    const workspaceId = req.workspaceId;

    const fileResponse = await this.fileService
      .getFilePresignedUrlOrStreamById({
        fileId,
        workspaceId,
        fileFolder,
        rangeHeader: req.headers.range,
      })
      .catch((error) => {
        if (error instanceof FileException) {
          throw error;
        }

        this.logger.error(
          'getFilePresignedUrlOrStreamById failed unexpectedly',
          {
            error,
          },
        );

        throw new FileException(
          'Error retrieving file',
          FileExceptionCode.INTERNAL_SERVER_ERROR,
        );
      });

    if (fileResponse === null) {
      throw new FileException(
        'File not found',
        FileExceptionCode.FILE_NOT_FOUND,
      );
    }

    if (fileResponse.type === 'redirect') {
      return res.redirect(fileResponse.presignedUrl);
    }

    setFileResponseHeaders(res, fileResponse.mimeType, fileFolder);
    res.setHeader('Accept-Ranges', 'bytes');

    if (isDefined(fileResponse.contentRange)) {
      const { startByte, endByte, fileSizeInBytes } = fileResponse.contentRange;

      res.status(206);
      res.setHeader(
        'Content-Range',
        `bytes ${startByte}-${endByte}/${fileSizeInBytes}`,
      );
      res.setHeader('Content-Length', String(endByte - startByte + 1));
    }

    try {
      await pipeline(fileResponse.stream, res);
    } catch (error) {
      this.logger.error('File-by-id stream failed mid-transfer', { error });

      if (!res.headersSent) {
        throw new FileException(
          'Error streaming file from storage',
          FileExceptionCode.INTERNAL_SERVER_ERROR,
        );
      }

      res.destroy();
    }
  }
}
