import { Inject, Injectable, Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';

import { Response } from 'express';

import { ExceptionHandlerUser } from 'src/engine/core-modules/exception-handler/interfaces/exception-handler-user.interface';
import { ExceptionHandlerWorkspace } from 'src/engine/core-modules/exception-handler/interfaces/exception-handler-workspace.interface';

import { ExceptionHandlerService } from 'src/engine/core-modules/exception-handler/exception-handler.service';
import { CustomException } from 'src/utils/custom-exception';

export const handleException = (
  exception: CustomException,
  exceptionHandlerService: ExceptionHandlerService,
  user?: ExceptionHandlerUser,
  workspace?: ExceptionHandlerWorkspace,
): CustomException => {
  exceptionHandlerService.captureExceptions([exception], { user, workspace });

  return exception;
};

interface RequestAndParams {
  request: Request | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  params: any;
}

@Injectable({ scope: Scope.REQUEST })
export class HttpExceptionHandlerService {
  constructor(
    private readonly exceptionHandlerService: ExceptionHandlerService,
    @Inject(REQUEST)
    private readonly request: RequestAndParams | null,
  ) {}

  handleError = (
    exception: CustomException,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    response: Response<any, Record<string, any>>,
    errorCode?: number,
    user?: ExceptionHandlerUser,
    workspace?: ExceptionHandlerWorkspace,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ): Response<any, Record<string, any>> | undefined => {
    const params = this.request?.params;

    if (params?.workspaceId)
      workspace = { ...workspace, id: params.workspaceId };
    if (params?.userId) user = { ...user, id: params.userId };

    handleException(exception, this.exceptionHandlerService, user, workspace);
    const statusCode = errorCode || 500;

    return response.status(statusCode).send({
      statusCode,
      error: exception.name || 'Bad Request',
      messages: [exception?.message],
    });
  };
}
