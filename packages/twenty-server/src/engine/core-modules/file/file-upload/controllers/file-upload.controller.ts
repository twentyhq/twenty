import {
  Controller,
  Param,
  Put,
  Req,
  Res,
  UseFilters,
  UseGuards,
} from '@nestjs/common';

import { Request, Response } from 'express';
import { ApiPath } from 'twenty-shared/types';

import { FileUploadApiExceptionFilter } from 'src/engine/core-modules/file/file-upload/filters/file-upload-api-exception.filter';
import { FileUploadTokenGuard } from 'src/engine/core-modules/file/file-upload/guards/file-upload-token.guard';
import { FileUploadService } from 'src/engine/core-modules/file/file-upload/services/file-upload.service';
import { NoPermissionGuard } from 'src/engine/guards/no-permission.guard';

@Controller()
@UseFilters(FileUploadApiExceptionFilter)
export class FileUploadController {
  constructor(private readonly fileUploadService: FileUploadService) {}

  // Streaming target for direct uploads when storage has no presigned upload
  // support (local driver, or S3 without presign enabled). The body is piped
  // to the storage driver without ever being buffered in memory.
  @Put(`${ApiPath.FileUpload}/:id`)
  @UseGuards(FileUploadTokenGuard, NoPermissionGuard)
  async uploadFileById(
    @Req() req: Request & { workspaceId: string },
    @Res() res: Response,
    @Param('id') fileId: string,
  ) {
    await this.fileUploadService.receiveFileStream({
      workspaceId: req.workspaceId,
      fileId,
      stream: req,
    });

    res.status(204).send();
  }
}
