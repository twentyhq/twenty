import {
  BadRequestException,
  type HttpException,
  Inject,
  Injectable,
  InternalServerErrorException,
  Scope,
} from '@nestjs/common';
import { REQUEST } from '@nestjs/core';

import { type Response } from 'express';
import { QueryFailedError } from 'typeorm';

import { type ExceptionHandlerUser } from 'src/engine/core-modules/exception-handler/interfaces/exception-handler-user.interface';
import { type ExceptionHandlerWorkspace } from 'src/engine/core-modules/exception-handler/interfaces/exception-handler-workspace.interface';

import { PostgresException } from 'src/engine/api/graphql/workspace-query-runner/utils/postgres-exception';
import { ExceptionHandlerService } from 'src/engine/core-modules/exception-handler/exception-handler.service';
import {
  TwentyORMException,
  TwentyORMExceptionCode,
} from 'src/engine/twenty-orm/exceptions/twenty-orm.exception';
import { handleException } from 'src/engine/utils/global-exception-handler.util';
import { CustomException } from 'src/utils/custom-exception';

interface RequestAndParams {
  request: Request | null;
  params: Record<string, string | undefined>;
}

const getErrorNameFromStatusCode = (statusCode: number) => {
  switch (statusCode) {
    case 400:
      return 'BadRequestException';
    case 401:
      return 'UnauthorizedException';
    case 402:
      return 'PaymentRequiredException';
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
    response: Response,
    errorCode?: number,
    user?: ExceptionHandlerUser,
    workspace?: ExceptionHandlerWorkspace,
  ): Response | undefined => {
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

    if (
      exception instanceof TwentyORMException &&
      [
        TwentyORMExceptionCode.INVALID_INPUT,
        TwentyORMExceptionCode.DUPLICATE_ENTRY_DETECTED,
        TwentyORMExceptionCode.CONNECT_UNIQUE_CONSTRAINT_ERROR,
        TwentyORMExceptionCode.CONNECT_NOT_ALLOWED,
        TwentyORMExceptionCode.CONNECT_RECORD_NOT_FOUND,
      ].includes(exception.code)
    ) {
      exception = new BadRequestException(exception.message);
      statusCode = 400;
    }

    if (exception instanceof PostgresException) {
      exception = new InternalServerErrorException(exception.message);
      statusCode = 500;
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
      code: exception instanceof CustomException ? exception.code : undefined,
    });
  };
}
