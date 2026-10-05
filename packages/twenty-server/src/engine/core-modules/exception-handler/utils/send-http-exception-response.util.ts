import {
  BadRequestException,
  type HttpException,
  InternalServerErrorException,
} from '@nestjs/common';

import { type Response } from 'express';
import { CustomError } from 'twenty-shared/utils';
import { QueryFailedError } from 'typeorm';

import { PostgresException } from 'src/engine/api/graphql/workspace-query-runner/utils/postgres-exception';
import { EXCEPTION_CATEGORY_HTTP_STATUS } from 'src/engine/core-modules/exception-handler/constants/exception-category-http-status.constant';
import { type ExceptionHandlerService } from 'src/engine/core-modules/exception-handler/exception-handler.service';
import { type ExceptionHandlerUser } from 'src/engine/core-modules/exception-handler/interfaces/exception-handler-user.interface';
import { type ExceptionHandlerWorkspace } from 'src/engine/core-modules/exception-handler/interfaces/exception-handler-workspace.interface';
import { hasRestResponse } from 'src/engine/core-modules/exception-handler/utils/has-rest-response.util';
import { handleException } from 'src/engine/utils/global-exception-handler.util';
import { CustomException } from 'src/utils/custom-exception';

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
    case 410:
      return 'GoneException';
    case 413:
      return 'PayloadTooLargeException';
    case 416:
      return 'RequestedRangeNotSatisfiableException';
    case 422:
      return 'UnprocessableEntityException';
    case 429:
      return 'TooManyRequestsException';
    case 500:
      return 'InternalServerErrorException';
    case 502:
      return 'BadGatewayException';
    case 503:
      return 'ServiceUnavailableException';
    case 504:
      return 'GatewayTimeoutException';
    default: {
      if (statusCode >= 500) {
        return 'InternalServerErrorException';
      }

      return 'BadRequestException';
    }
  }
};

export const sendHttpExceptionResponse = ({
  exception,
  response,
  fallbackStatusCode = 500,
  exceptionHandlerService,
  user,
  workspace,
  shouldBeCapturedBySentry = true,
}: {
  exception: Error | HttpException;
  response: Response;
  fallbackStatusCode?: number;
  exceptionHandlerService: ExceptionHandlerService;
  user?: ExceptionHandlerUser;
  workspace?: ExceptionHandlerWorkspace;
  shouldBeCapturedBySentry?: boolean;
}): Response => {
  let statusCode =
    exception instanceof CustomException
      ? EXCEPTION_CATEGORY_HTTP_STATUS[exception.category]
      : fallbackStatusCode;

  if (exception instanceof QueryFailedError) {
    exception = new BadRequestException(exception.message);
    statusCode = 400;
  }

  if (exception instanceof PostgresException) {
    exception = new InternalServerErrorException(exception.message);
    statusCode = 500;
  }

  handleException({
    exception,
    exceptionHandlerService,
    user,
    workspace,
    statusCode,
    shouldBeCapturedBySentry,
  });

  if (hasRestResponse(exception)) {
    return response.status(statusCode).send(exception.getResponseBody());
  }

  return response.status(statusCode).send({
    statusCode,
    error:
      exception instanceof CustomException
        ? getErrorNameFromStatusCode(statusCode)
        : (exception.name ?? getErrorNameFromStatusCode(statusCode)),
    messages: [exception?.message],
    code: exception instanceof CustomError ? exception.code : undefined,
  });
};
