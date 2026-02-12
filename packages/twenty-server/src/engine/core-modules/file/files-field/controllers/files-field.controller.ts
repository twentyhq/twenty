import {
  Controller,
  Get,
  Param,
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
import { FilesFieldService } from 'src/engine/core-modules/file/files-field/files-field.service';
import { FilesFieldGuard } from 'src/engine/core-modules/file/files-field/guards/files-field.guard';
import { FileApiExceptionFilter } from 'src/engine/core-modules/file/filters/file-api-exception.filter';
import { NoPermissionGuard } from 'src/engine/guards/no-permission.guard';

@Controller('files-field')
@UseFilters(FileApiExceptionFilter)
export class FilesFieldController {
  constructor(private readonly filesFieldService: FilesFieldService) {}

  @Get(':id')
  @UseGuards(FilesFieldGuard, NoPermissionGuard)
  async getFileById(
    @Res() res: Response,
    @Req() req: Request,
    @Param('id') fileId: string,
  ) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const workspaceId = (req as any)?.workspaceId;

    try {
      const fileStream = await this.filesFieldService.getFileStream({
        fileId,
        workspaceId,
      });

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
