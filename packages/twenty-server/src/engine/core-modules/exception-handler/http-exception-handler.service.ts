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
): void => {
  exceptionHandlerService.captureExceptions([exception], { user, workspace });
};

interface RequestAndParams {
  request: Request | null;
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
    response: Response<any, Record<string, any>>,
    errorCode?: number,
    user?: ExceptionHandlerUser,
    workspace?: ExceptionHandlerWorkspace,
  ): Response<any, Record<string, any>> | undefined => {
    const params = this.request?.params;

    if (params?.workspaceId)
      workspace = { ...workspace, id: params.workspaceId };
    if (params?.userId) user = { ...user, id: params.userId };

    handleException(exception, this.exceptionHandlerService, user, workspace);

    return response.status(errorCode || 500).send(exception.message);
  };
}
