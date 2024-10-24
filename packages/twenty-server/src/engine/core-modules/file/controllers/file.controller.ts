import { Controller, Get, Param, Req, Res, UseGuards } from '@nestjs/common';

import { Response } from 'express';

import {
  FileStorageException,
  FileStorageExceptionCode,
} from 'src/engine/core-modules/file-storage/interfaces/file-storage-exception';

import {
  checkFilePath,
  checkFilename,
} from 'src/engine/core-modules/file/file.utils';
import { FilePathGuard } from 'src/engine/core-modules/file/guards/file-path-guard';
import { FileService } from 'src/engine/core-modules/file/services/file.service';

// TODO: Add cookie authentication
@Controller('files')
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
      return res
        .status(401)
        .send({ error: 'Unauthorized, missing workspaceId' });
    }

    try {
      const fileStream = await this.fileService.getFileStream(
        folderPath,
        filename,
        workspaceId,
      );

      fileStream.on('error', () => {
        res.status(500).send({ error: 'Internal server error' });
      });

      fileStream.pipe(res);
    } catch (error) {
      if (
        error instanceof FileStorageException &&
        error.code === FileStorageExceptionCode.FILE_NOT_FOUND
      ) {
        return res.status(404).send({ error: 'File not found' });
      }

      return res.status(500).send({ error: 'Internal server error' });
    }
  }
}
