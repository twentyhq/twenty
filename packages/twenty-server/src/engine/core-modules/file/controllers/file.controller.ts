import {
  Controller,
  Get,
  Param,
  Req,
  Res,
  UseFilters,
  UseGuards,
} from '@nestjs/common';

import { Response } from 'express';

import {
  FileStorageException,
  FileStorageExceptionCode,
} from 'src/engine/core-modules/file-storage/interfaces/file-storage-exception';

import {
  FileException,
  FileExceptionCode,
} from 'src/engine/core-modules/file/file.exception';
import {
  checkFilePath,
  checkFilename,
} from 'src/engine/core-modules/file/file.utils';
import { FileApiExceptionFilter } from 'src/engine/core-modules/file/filters/file-api-exception.filter';
import { FilePathGuard } from 'src/engine/core-modules/file/guards/file-path-guard';
import { FileService } from 'src/engine/core-modules/file/services/file.service';

@Controller('files')
@UseFilters(FileApiExceptionFilter)
@UseGuards(FilePathGuard)
export class FileController {
  constructor(private readonly fileService: FileService) {}

  @Get('*/:filename')
  async getFile(
    @Param() params: string[],
    @Res() res: Response,
    @Req() req: Request,
  ) {
    const folderPath = checkFilePath(params[0]);
    const filename = checkFilename(params['filename']);

    const workspaceId = (req as any)?.workspaceId;

    if (!workspaceId) {
      throw new FileException(
        'Unauthorized: missing workspaceId',
        FileExceptionCode.UNAUTHENTICATED,
      );
    }

    try {
      const fileStream = await this.fileService.getFileStream(
        folderPath,
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
