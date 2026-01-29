import {
  type ArgumentsHost,
  Catch,
  type ExceptionFilter,
} from '@nestjs/common';

import { type Response } from 'express';

import { HttpExceptionHandlerService } from 'src/engine/core-modules/exception-handler/http-exception-handler.service';
import {
  FilesFieldException,
  FilesFieldExceptionCode,
} from 'src/engine/core-modules/file/files-field/files-field.exception';

@Catch(FilesFieldException)
export class FilesFieldApiExceptionFilter implements ExceptionFilter {
  constructor(
    private readonly httpExceptionHandlerService: HttpExceptionHandlerService,
  ) {}

  catch(exception: FilesFieldException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    switch (exception.code) {
      case FilesFieldExceptionCode.UNAUTHENTICATED:
        return this.httpExceptionHandlerService.handleError(
          exception,
          response,
          403,
        );
      case FilesFieldExceptionCode.FILE_NOT_FOUND:
        return this.httpExceptionHandlerService.handleError(
          exception,
          response,
          404,
        );
      case FilesFieldExceptionCode.FILE_DELETION_FAILED:
        return this.httpExceptionHandlerService.handleError(
          exception,
          response,
          500,
        );
      case FilesFieldExceptionCode.INTERNAL_SERVER_ERROR:
      default:
        return this.httpExceptionHandlerService.handleError(
          exception,
          response,
          500,
        );
    }
  }
}
