import { type ArgumentsHost } from '@nestjs/common';

import { type Response } from 'express';

import { type HttpExceptionHandlerService } from 'src/engine/core-modules/exception-handler/http-exception-handler.service';
import { RouteTriggerRestApiExceptionFilter } from 'src/engine/core-modules/logic-function/logic-function-trigger/triggers/route/exceptions/route-trigger-rest-api-exception-filter';
import {
  RouteTriggerException,
  RouteTriggerExceptionCode,
} from 'src/engine/core-modules/logic-function/logic-function-trigger/triggers/route/exceptions/route-trigger.exception';

describe('RouteTriggerRestApiExceptionFilter', () => {
  const handleError = jest.fn();
  const response = {} as Response;

  const httpExceptionHandlerService = {
    handleError,
  } as unknown as HttpExceptionHandlerService;

  const filter = new RouteTriggerRestApiExceptionFilter(
    httpExceptionHandlerService,
  );

  const host = {
    switchToHttp: () => ({ getResponse: () => response }),
  } as unknown as ArgumentsHost;

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

  it('maps a disabled function to 403', () => {
    const exception = new RouteTriggerException(
      'disabled',
      RouteTriggerExceptionCode.FORBIDDEN_EXCEPTION,
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
