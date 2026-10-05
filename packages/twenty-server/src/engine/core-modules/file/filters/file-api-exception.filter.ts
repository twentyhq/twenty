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
    const response = host.switchToHttp().getResponse<Response>();

    if (
      exception.code === FileExceptionCode.RANGE_NOT_SATISFIABLE &&
      isDefined(exception.fileSizeInBytes)
    ) {
      response.setHeader(
        'Content-Range',
        `bytes */${exception.fileSizeInBytes}`,
      );
    }

    return this.httpExceptionHandlerService.handleError(exception, response);
  }
}
