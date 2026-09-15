import { HttpStatus } from '@nestjs/common';

import { UsageOperationType } from 'src/engine/core-modules/usage/enums/usage-operation-type.enum';
import { UsageResourceType } from 'src/engine/core-modules/usage/enums/usage-resource-type.enum';
import { UsageLimitHttpException } from 'src/engine/core-modules/usage-limit/exceptions/usage-limit-http.exception';
import {
  UsageLimitException,
  UsageLimitExceptionCode,
} from 'src/engine/core-modules/usage-limit/exceptions/usage-limit.exception';
import { type ExhaustedScope } from 'src/engine/core-modules/usage-limit/types/exhausted-scope.type';
import { usageLimitToRestApiExceptionHandler } from 'src/engine/core-modules/usage-limit/utils/usage-limit-to-rest-api-exception-handler.util';

const buildExhaustedScope = (
  overrides: Partial<ExhaustedScope> = {},
): ExhaustedScope => ({
  resourceType: UsageResourceType.API,
  limitKind: 'speed',
  exhaustedKind: 'limit',
  spenderType: 'apiKey',
  spenderId: 'key-1',
  operationType: UsageOperationType.API_REQUEST,
  limitValue: 3,
  remaining: 0,
  periodCount: 60,
  periodUnit: 'second',
  retryAfterMs: 11983,
  isDefault: true,
  ...overrides,
});

const catchThrown = (
  exhaustedScope?: ExhaustedScope,
  {
    message = 'Rate limit exceeded for apiKey: 3 requests per 60s.',
    code = UsageLimitExceptionCode.RATE_LIMITED,
  }: { message?: string; code?: UsageLimitExceptionCode } = {},
): UsageLimitHttpException => {
  try {
    usageLimitToRestApiExceptionHandler(
      new UsageLimitException(message, code, { exhaustedScope }),
    );
  } catch (error) {
    return error as UsageLimitHttpException;
  }

  throw new Error('the handler was expected to throw');
};

describe('usageLimitToRestApiExceptionHandler', () => {
  it('answers 429 with the exhausted scope in the body', () => {
    const error = catchThrown(buildExhaustedScope());

    expect(error.getStatus()).toBe(HttpStatus.TOO_MANY_REQUESTS);
    expect(error.getResponseBody()).toEqual({
      statusCode: HttpStatus.TOO_MANY_REQUESTS,
      error: 'RATE_LIMITED',
      messages: ['Rate limit exceeded for apiKey: 3 requests per 60s.'],
      limitKind: 'speed',
      exhaustedKind: 'limit',
      scope: {
        spenderType: 'apiKey',
        spenderId: 'key-1',
        operationType: UsageOperationType.API_REQUEST,
      },
      limit: 3,
      remaining: 0,
      periodCount: 60,
      periodUnit: 'second',
      retryAfterSeconds: 12,
    });
  });

  it('tells the caller when to come back', () => {
    expect(catchThrown(buildExhaustedScope()).getResponseHeaders()).toEqual(
      expect.objectContaining({
        'Retry-After': '12',
        'X-RateLimit-Limit': '3',
        'X-RateLimit-Remaining': '0',
      }),
    );
  });

  it('never asks the caller to retry in zero seconds', () => {
    expect(
      catchThrown(
        buildExhaustedScope({ retryAfterMs: 4 }),
      ).getResponseHeaders()['Retry-After'],
    ).toBe('1');
  });

  it('answers 429 with retry headers when a configured quota is exhausted', () => {
    const error = catchThrown(
      buildExhaustedScope({
        resourceType: UsageResourceType.AI,
        limitKind: 'quota',
        operationType: UsageOperationType.ALL,
        periodCount: 1,
        periodUnit: 'month',
      }),
      {
        message: 'Usage limit reached for apiKey',
        code: UsageLimitExceptionCode.QUOTA_EXHAUSTED,
      },
    );

    expect(error.getStatus()).toBe(HttpStatus.TOO_MANY_REQUESTS);
    expect(error.getResponseBody()).toEqual(
      expect.objectContaining({
        statusCode: HttpStatus.TOO_MANY_REQUESTS,
        error: 'QUOTA_EXHAUSTED',
        limitKind: 'quota',
        exhaustedKind: 'limit',
      }),
    );
    expect(error.getResponseHeaders()).toEqual(
      expect.objectContaining({ 'Retry-After': '12' }),
    );
  });

  it('answers 402 without retry headers when the credit allowance is exhausted', () => {
    const error = catchThrown(
      buildExhaustedScope({
        resourceType: UsageResourceType.AI,
        limitKind: 'quota',
        exhaustedKind: 'allowance',
        spenderType: 'workspace',
        spenderId: null,
        operationType: UsageOperationType.ALL,
        periodCount: null,
        periodUnit: null,
      }),
      {
        message: 'Credit allowance exhausted for this billing period',
        code: UsageLimitExceptionCode.QUOTA_EXHAUSTED,
      },
    );

    expect(error.getStatus()).toBe(HttpStatus.PAYMENT_REQUIRED);
    expect(error.getResponseBody()).toEqual(
      expect.objectContaining({
        statusCode: HttpStatus.PAYMENT_REQUIRED,
        error: 'QUOTA_EXHAUSTED',
        exhaustedKind: 'allowance',
      }),
    );
    expect(error.getResponseHeaders()).toEqual({});
  });

  it('keeps the message readable for logs', () => {
    expect(catchThrown(buildExhaustedScope()).message).toBe(
      'Rate limit exceeded for apiKey: 3 requests per 60s.',
    );
  });

  it('falls back to a bare 429 when no scope was resolved', () => {
    let thrown: unknown;

    try {
      usageLimitToRestApiExceptionHandler(
        new UsageLimitException(
          'Rate limit exceeded.',
          UsageLimitExceptionCode.RATE_LIMITED,
        ),
      );
    } catch (error) {
      thrown = error;
    }

    expect(thrown).not.toBeInstanceOf(UsageLimitHttpException);
  });
});
