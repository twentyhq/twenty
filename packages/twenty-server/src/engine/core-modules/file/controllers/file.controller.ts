import {
  Controller,
  Get,
  Param,
  Req,
  Res,
  UseFilters,
  UseGuards,
} from '@nestjs/common';

import { join } from 'path';

import { Request, Response } from 'express';
import { FileFolder } from 'twenty-shared/types';

import {
  FileStorageException,
  FileStorageExceptionCode,
} from 'src/engine/core-modules/file-storage/interfaces/file-storage-exception';

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

    try {
      const { stream, mimeType } = await this.fileService.getFileStreamByPath({
        workspaceId,
        applicationId,
        fileFolder: FileFolder.PublicAsset,
        filepath,
      });

      setFileResponseHeaders(res, mimeType);

      stream.on('error', () => {
        throw new FileException(
          'Error streaming file from storage',
          FileExceptionCode.INTERNAL_SERVER_ERROR,
        );
      });

      stream.pipe(res);
    } catch (error) {
      if (
        error instanceof FileStorageException &&
        error.code === FileStorageExceptionCode.FILE_NOT_FOUND
      ) {
        throw new FileException(
          'File not found',
          FileExceptionCode.FILE_NOT_FOUND,
        );
      }

      throw new FileException(
        `Error retrieving file: ${error.message}`,
        FileExceptionCode.INTERNAL_SERVER_ERROR,
      );
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
    // oxlint-disable-next-line @typescripttypescript/no-explicit-any
    const workspaceId = (req as any)?.workspaceId;

    try {
      const fileResponse = await this.fileService.getFileResponseById({
        fileId,
        workspaceId,
        fileFolder,
      });

      if (fileResponse.type === 'redirect') {
        return res.redirect(fileResponse.presignedUrl);
      }

      setFileResponseHeaders(res, fileResponse.mimeType);

      fileResponse.stream.on('error', () => {
        if (!res.headersSent) {
          res.status(500).send('Error streaming file from storage');

          return;
        }

        res.destroy();
      });

      fileResponse.stream.pipe(res);
    } catch (error) {
      if (
        error instanceof FileStorageException &&
        error.code === FileStorageExceptionCode.FILE_NOT_FOUND
      ) {
        throw new FileException(
          'File not found',
          FileExceptionCode.FILE_NOT_FOUND,
        );
      }

      throw new FileException(
        `Error retrieving file: ${error.message}`,
        FileExceptionCode.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
