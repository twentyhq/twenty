import { Inject, Injectable, Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';

import { ExceptionHandlerUser } from 'src/engine/core-modules/exception-handler/interfaces/exception-handler-user.interface';
import { ExceptionHandlerWorkspace } from 'src/engine/core-modules/exception-handler/interfaces/exception-handler-workspace.interface';

import { AuthException } from 'src/engine/core-modules/auth/auth.exception';
import { ExceptionHandlerService } from 'src/engine/core-modules/exception-handler/exception-handler.service';

export const handleException = (
  exception: AuthException,
  exceptionHandlerService: ExceptionHandlerService,
  user?: ExceptionHandlerUser,
  workspace?: ExceptionHandlerWorkspace,
): void => {
  exceptionHandlerService.captureExceptions([exception], { user, workspace });
};

@Injectable({ scope: Scope.REQUEST })
export class ErrorHandlerService {
  constructor(
    private readonly exceptionHandlerService: ExceptionHandlerService,
    @Inject(REQUEST)
    private readonly request: Request | null,
  ) {}

  handleError = (
    exception: AuthException,
    response?: any,
    errorCode?: number,
    user?: ExceptionHandlerUser,
    workspace?: ExceptionHandlerWorkspace,
  ) => {
    // console.log('scope', this.request?);
    handleException(exception, this.exceptionHandlerService, user, workspace);

    return response.status(errorCode).send(exception.message);
  };
}
