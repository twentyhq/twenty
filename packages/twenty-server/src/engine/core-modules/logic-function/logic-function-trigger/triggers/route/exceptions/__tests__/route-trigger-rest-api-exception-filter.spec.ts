import { ExecutionContextHost } from '@nestjs/core/helpers/execution-context-host';
import { Test } from '@nestjs/testing';

import { type Response } from 'express';

import {
  AuthException,
  AuthExceptionCode,
} from 'src/engine/core-modules/auth/auth.exception';
import { HttpExceptionHandlerService } from 'src/engine/core-modules/exception-handler/http-exception-handler.service';
import { RouteTriggerRestApiExceptionFilter } from 'src/engine/core-modules/logic-function/logic-function-trigger/triggers/route/exceptions/route-trigger-rest-api-exception-filter';
import {
  RouteTriggerException,
  RouteTriggerExceptionCode,
} from 'src/engine/core-modules/logic-function/logic-function-trigger/triggers/route/exceptions/route-trigger.exception';

describe('RouteTriggerRestApiExceptionFilter', () => {
  const handleError = jest.fn();
  const response = {} as Response;

  const host = new ExecutionContextHost([{}, response]);

  let filter: RouteTriggerRestApiExceptionFilter;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      providers: [
        RouteTriggerRestApiExceptionFilter,
        {
          provide: HttpExceptionHandlerService,
          useValue: { handleError },
        },
      ],
    }).compile();

    filter = module.get(RouteTriggerRestApiExceptionFilter);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('returns 500 and does NOT capture user-uncaught errors in Sentry', () => {
    const exception = new RouteTriggerException(
      'boom',
      RouteTriggerExceptionCode.ROUTE_TRIGGER_USER_UNCAUGHT_ERROR,
    );

    filter.catch(exception, host);

    expect(handleError).toHaveBeenCalledWith(
      exception,
      response,
      500,
      undefined,
      undefined,
      { shouldBeCapturedBySentry: false },
    );
  });

  it('returns 500 and captures platform errors in Sentry', () => {
    const exception = new RouteTriggerException(
      'boom',
      RouteTriggerExceptionCode.ROUTE_TRIGGER_PLATFORM_ERROR,
    );

    filter.catch(exception, host);

    expect(handleError).toHaveBeenCalledWith(exception, response, 500);
  });

  it('maps oversized dependencies to 422 without Sentry capture', () => {
    const exception = new RouteTriggerException(
      'dependencies too large',
      RouteTriggerExceptionCode.LOGIC_FUNCTION_DEPENDENCIES_SIZE_EXCEEDED,
    );

    filter.catch(exception, host);

    expect(handleError).toHaveBeenCalledWith(
      exception,
      response,
      422,
      undefined,
      undefined,
      { shouldBeCapturedBySentry: false },
    );
  });

  it('maps an invalid token to 401', () => {
    const exception = new AuthException(
      'Invalid token',
      AuthExceptionCode.UNAUTHENTICATED,
    );

    filter.catch(exception, host);

    expect(handleError).toHaveBeenCalledWith(exception, response, 401);
  });

  it('maps a token refused for this workspace to 403', () => {
    const exception = new AuthException(
      'User is not a member of the workspace',
      AuthExceptionCode.FORBIDDEN_EXCEPTION,
    );

    filter.catch(exception, host);

    expect(handleError).toHaveBeenCalledWith(exception, response, 403);
  });

  it('maps a disabled function to 403', () => {
    const exception = new RouteTriggerException(
      'disabled',
      RouteTriggerExceptionCode.FORBIDDEN_EXCEPTION,
    );

    filter.catch(exception, host);

    expect(handleError).toHaveBeenCalledWith(exception, response, 403);
  });

  it('maps a suspended workspace to 403', () => {
    const exception = new RouteTriggerException(
      'suspended',
      RouteTriggerExceptionCode.WORKSPACE_SUSPENDED,
    );

    filter.catch(exception, host);

    expect(handleError).toHaveBeenCalledWith(exception, response, 403);
  });

  it('maps not-found codes to 404', () => {
    const exception = new RouteTriggerException(
      'missing',
      RouteTriggerExceptionCode.LOGIC_FUNCTION_NOT_FOUND,
    );

    filter.catch(exception, host);

    expect(handleError).toHaveBeenCalledWith(exception, response, 404);
  });
});
