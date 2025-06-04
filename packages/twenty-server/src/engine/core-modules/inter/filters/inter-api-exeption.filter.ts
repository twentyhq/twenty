import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';

import { AxiosError } from 'axios';
import { Response } from 'express';

// TODO: Map inter invalid body requests and return the error propery.
@Catch(HttpException)
export class InterApiExceptionFilter implements ExceptionFilter {
  private readonly logger: Logger = new Logger('InterApiExceptionFilter');

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    // Log the exception for debugging purposes
    this.logger.error('Caught exception in Inter API:', exception);

    // Handle specific Inter exceptions
    if (exception instanceof AxiosError) {
      return this.handleInterException(exception, response);
    }

    if (exception instanceof HttpException) {
      return this.handleUnknonwHttpException(exception, response);
    }

    // Handle generic exceptions
    return this.handleGenericException(response);
  }

  private handleUnknonwHttpException(
    exception: HttpException,
    response: Response,
  ) {
    const status = HttpStatus.INTERNAL_SERVER_ERROR;

    return response.status(status).json({
      statusCode: status,
      message: exception.message,
      error: 'Inter API Error',
    });
  }

  private handleInterException(exception: AxiosError, response: Response) {
    const status = exception.status || 400;

    return response.status(status).json({
      statusCode: status,
      message: exception.message,
      error: 'Inter API Error',
    });
  }

  private handleGenericException(response: Response) {
    return response.status(500).json({
      statusCode: 500,
      message: 'Internal Server Error',
      error: 'Internal Server Error',
    });
  }
}
