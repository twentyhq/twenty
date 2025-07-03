import {
  BadRequestException,
  HttpException,
  Inject,
  Injectable,
  Scope,
} from '@nestjs/common';
import { REQUEST } from '@nestjs/core';

import { Response } from 'express';
import { QueryFailedError } from 'typeorm';

import { ExceptionHandlerUser } from 'src/engine/core-modules/exception-handler/interfaces/exception-handler-user.interface';
import { ExceptionHandlerWorkspace } from 'src/engine/core-modules/exception-handler/interfaces/exception-handler-workspace.interface';

import { ExceptionHandlerService } from 'src/engine/core-modules/exception-handler/exception-handler.service';
import { handleException } from 'src/engine/utils/global-exception-handler.util';

interface RequestAndParams {
  request: Request | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  params: any;
}

const getErrorNameFromStatusCode = (statusCode: number) => {
  switch (statusCode) {
    case 400:
      return 'BadRequestException';
    case 401:
      return 'UnauthorizedException';
    case 403:
      return 'ForbiddenException';
    case 404:
      return 'NotFoundException';
    case 405:
      return 'MethodNotAllowedException';
    case 409:
      return 'ConflictException';
    case 422:
      return 'UnprocessableEntityException';
    case 500:
      return 'InternalServerErrorException';
    default: {
      if (statusCode >= 500) {
        return 'InternalServerErrorException';
      }

      return 'BadRequestException';
    }
  }
};

@Injectable({ scope: Scope.REQUEST })
export class HttpExceptionHandlerService {
  constructor(
    private readonly exceptionHandlerService: ExceptionHandlerService,
    @Inject(REQUEST)
    private readonly request: RequestAndParams | null,
  ) {}

  handleError = (
    exception: Error | HttpException,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    response: Response<any, Record<string, any>>,
    errorCode?: number,
    user?: ExceptionHandlerUser,
    workspace?: ExceptionHandlerWorkspace,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ): Response<any, Record<string, any>> | undefined => {
    const params = this.request?.params;

    if (params?.workspaceId) {
      workspace = { ...workspace, id: params.workspaceId };
    }

    if (params?.userId) {
      user = { ...user, id: params.userId };
    }

    let statusCode = errorCode || 500;

    if (exception instanceof QueryFailedError) {
      exception = new BadRequestException(exception.message);
      statusCode = 400;
    }

    handleException({
      exception,
      exceptionHandlerService: this.exceptionHandlerService,
      user,
      workspace,
      statusCode,
    });

    return response.status(statusCode).send({
      statusCode,
      error: exception.name ?? getErrorNameFromStatusCode(statusCode),
      messages: [exception?.message],
    });
  };
}
