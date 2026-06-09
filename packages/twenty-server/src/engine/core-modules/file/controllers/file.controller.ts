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

import { Request, Response } from 'express';
import { FileFolder } from 'twenty-shared/types';

import { validateFilePath } from 'src/engine/core-modules/file-storage/utils/validate-file-path.util';
import {
  FileException,
  FileExceptionCode,
} from 'src/engine/core-modules/file/file.exception';
import { FileApiExceptionFilter } from 'src/engine/core-modules/file/filters/file-api-exception.filter';
import {
  FileByIdGuard,
  SupportedFileFolder,
} from 'src/engine/core-modules/file/guards/file-by-id.guard';
import { FileService } from 'src/engine/core-modules/file/services/file.service';
import { setFileResponseHeaders } from 'src/engine/core-modules/file/utils/set-file-response-headers.utils';
import { NoPermissionGuard } from 'src/engine/guards/no-permission.guard';
import { PublicEndpointGuard } from 'src/engine/guards/public-endpoint.guard';

@Controller()
@UseFilters(FileApiExceptionFilter)
export class FileController {
  private readonly logger = new Logger(FileController.name);

  constructor(private readonly fileService: FileService) {}

  @Get('public-assets/:workspaceId/:applicationId/*path')
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

    setFileResponseHeaders(res, fileResponse.mimeType);

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

  @Get('file/:fileFolder/:id')
  @UseGuards(FileByIdGuard, NoPermissionGuard)
  async getFileById(
    @Res() res: Response,
    @Req() req: Request,
    @Param('fileFolder') fileFolder: SupportedFileFolder,
    @Param('id') fileId: string,
  ) {
    // oxlint-disable-next-line typescript/no-explicit-any
    const workspaceId = (req as any)?.workspaceId;

    const fileResponse = await this.fileService
      .getFilePresignedUrlOrStreamById({
        fileId,
        workspaceId,
        fileFolder,
      })
      .catch((error) => {
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

    setFileResponseHeaders(res, fileResponse.mimeType);

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
