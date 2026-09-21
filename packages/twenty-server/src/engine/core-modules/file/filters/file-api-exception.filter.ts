import {
  type ArgumentsHost,
  Catch,
  type ExceptionFilter,
} from '@nestjs/common';

import { type Response } from 'express';
import { isDefined } from 'twenty-shared/utils';

import { HttpExceptionHandlerService } from 'src/engine/core-modules/exception-handler/http-exception-handler.service';
import {
  FileException,
  FileExceptionCode,
} from 'src/engine/core-modules/file/file.exception';

@Catch(FileException)
export class FileApiExceptionFilter implements ExceptionFilter {
  constructor(
    private readonly httpExceptionHandlerService: HttpExceptionHandlerService,
  ) {}

  catch(exception: FileException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    switch (exception.code) {
      case FileExceptionCode.UNAUTHENTICATED:
        return this.httpExceptionHandlerService.handleError(
          exception,
          response,
          403,
        );
      case FileExceptionCode.FILE_NOT_FOUND:
        return this.httpExceptionHandlerService.handleError(
          exception,
          response,
          404,
        );
      case FileExceptionCode.RANGE_NOT_SATISFIABLE:
        if (isDefined(exception.fileSizeInBytes)) {
          response.setHeader(
            'Content-Range',
            `bytes */${exception.fileSizeInBytes}`,
          );
        }

        return this.httpExceptionHandlerService.handleError(
          exception,
          response,
          416,
        );
      case FileExceptionCode.INTERNAL_SERVER_ERROR:
      default:
        return this.httpExceptionHandlerService.handleError(
          exception,
          response,
          500,
        );
    }
  }
}
