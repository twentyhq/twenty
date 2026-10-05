import { type HttpException, Inject, Injectable, Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';

import { type Response } from 'express';

import { type ExceptionHandlerUser } from 'src/engine/core-modules/exception-handler/interfaces/exception-handler-user.interface';
import { type ExceptionHandlerWorkspace } from 'src/engine/core-modules/exception-handler/interfaces/exception-handler-workspace.interface';

import { ExceptionHandlerService } from 'src/engine/core-modules/exception-handler/exception-handler.service';
import { sendHttpExceptionResponse } from 'src/engine/core-modules/exception-handler/utils/send-http-exception-response.util';

interface RequestAndParams {
  request: Request | null;
  params: Record<string, string | undefined>;
}

@Injectable({ scope: Scope.REQUEST })
export class HttpExceptionHandlerService {
  constructor(
    private readonly exceptionHandlerService: ExceptionHandlerService,
    @Inject(REQUEST)
    private readonly request: RequestAndParams | null,
  ) {}

  // CustomExceptions always get their category's status; errorCode only applies to other errors
  handleError = (
    exception: Error | HttpException,
    response: Response,
    errorCode?: number,
    user?: ExceptionHandlerUser,
    workspace?: ExceptionHandlerWorkspace,
    {
      shouldBeCapturedBySentry = true,
    }: { shouldBeCapturedBySentry?: boolean } = {},
  ): Response | undefined => {
    const params = this.request?.params;

    if (params?.workspaceId) {
      workspace = { ...workspace, id: params.workspaceId };
    }

    if (params?.userId) {
      user = { ...user, id: params.userId };
    }

    return sendHttpExceptionResponse({
      exception,
      response,
      fallbackStatusCode: errorCode,
      exceptionHandlerService: this.exceptionHandlerService,
      user,
      workspace,
      shouldBeCapturedBySentry,
    });
  };
}
