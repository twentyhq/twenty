import { HttpException, HttpStatus, Injectable } from '@nestjs/common';

// export const handleException = (
//   exception: Error,
//   exceptionHandlerService: ExceptionHandlerService,
//   user?: ExceptionHandlerUser,
//   workspace?: ExceptionHandlerWorkspace,
// ): void => {
//   exceptionHandlerService.captureExceptions([exception], { user, workspace });
// };

@Injectable()
export class InternalServerErrorExceptionError extends HttpException {
  constructor(
    message: string,
    // private readonly exceptionHandlerService: ExceptionHandlerService,
  ) {
    // super(message)
    super(message, HttpStatus.INTERNAL_SERVER_ERROR);
    // handleException(this, exceptionHandlerService);

    Object.defineProperty(this, 'name', {
      value: 'InternalServerErrorExceptionError',
    });
  }
}

export class NotFoundExceptionError extends HttpException {
  constructor(
    message: string,
    // private readonly exceptionHandlerService: ExceptionHandlerService,
  ) {
    // super(message);
    super(message, HttpStatus.INTERNAL_SERVER_ERROR);
    // handleException(this, exceptionHandlerService);

    Object.defineProperty(this, 'name', { value: 'NotFoundExceptionError' });
  }
}

export class UnauthorizedExceptionError extends HttpException {
  constructor(
    message: string,
    // private readonly exceptionHandlerService: ExceptionHandlerService,
  ) {
    // super(message);
    super(message, HttpStatus.INTERNAL_SERVER_ERROR);
    // handleException(this, exceptionHandlerService);

    Object.defineProperty(this, 'name', {
      value: 'UnauthorizedExceptionError',
    });
  }
}
