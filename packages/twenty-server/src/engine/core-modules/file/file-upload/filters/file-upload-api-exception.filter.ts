import {
  type ArgumentsHost,
  Catch,
  type ExceptionFilter,
} from '@nestjs/common';

import { type Response } from 'express';

import { HttpExceptionHandlerService } from 'src/engine/core-modules/exception-handler/http-exception-handler.service';
import {
  FileUploadException,
  FileUploadExceptionCode,
} from 'src/engine/core-modules/file/file-upload/file-upload.exception';

@Catch(FileUploadException)
export class FileUploadApiExceptionFilter implements ExceptionFilter {
  constructor(
    private readonly httpExceptionHandlerService: HttpExceptionHandlerService,
  ) {}

  catch(exception: FileUploadException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    switch (exception.code) {
      case FileUploadExceptionCode.FILE_NOT_FOUND:
        return this.httpExceptionHandlerService.handleError(
          exception,
          response,
          404,
        );
      case FileUploadExceptionCode.FILE_TOO_LARGE:
        return this.httpExceptionHandlerService.handleError(
          exception,
          response,
          413,
        );
      case FileUploadExceptionCode.BAD_REQUEST:
      case FileUploadExceptionCode.FILE_NOT_UPLOADED:
      case FileUploadExceptionCode.FILE_SIZE_MISMATCH:
        return this.httpExceptionHandlerService.handleError(
          exception,
          response,
          400,
        );
      default:
        return this.httpExceptionHandlerService.handleError(
          exception,
          response,
          500,
        );
    }
  }
}
