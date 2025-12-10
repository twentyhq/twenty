import {
  Controller,
  Get,
  Req,
  Res,
  UseFilters,
  UseGuards,
} from '@nestjs/common';

import { Request, Response } from 'express';

import {
  FileStorageException,
  FileStorageExceptionCode,
} from 'src/engine/core-modules/file-storage/interfaces/file-storage-exception';

import {
  FileException,
  FileExceptionCode,
} from 'src/engine/core-modules/file/file.exception';
import { FileApiExceptionFilter } from 'src/engine/core-modules/file/filters/file-api-exception.filter';
import { FilePathGuard } from 'src/engine/core-modules/file/guards/file-path-guard';
import { FileService } from 'src/engine/core-modules/file/services/file.service';
import { extractFileInfoFromRequest } from 'src/engine/core-modules/file/utils/extract-file-info-from-request.utils';
import { NoPermissionGuard } from 'src/engine/guards/no-permission.guard';

@Controller('files')
@UseFilters(FileApiExceptionFilter)
export class FileController {
  constructor(private readonly fileService: FileService) {}

  @Get('*path')
  @UseGuards(FilePathGuard, NoPermissionGuard)
  async getFile(@Res() res: Response, @Req() req: Request) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const workspaceId = (req as any)?.workspaceId;

    const { rawFolder, filename } = extractFileInfoFromRequest(req);

    try {
      const fileStream = await this.fileService.getFileStream(
        rawFolder,
        filename,
        workspaceId,
      );

      fileStream.on('error', () => {
        throw new FileException(
          'Error streaming file from storage',
          FileExceptionCode.INTERNAL_SERVER_ERROR,
        );
      });

      fileStream.pipe(res);
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
