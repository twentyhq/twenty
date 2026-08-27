import { HttpStatus } from '@nestjs/common';

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
  operationType: null,
  limitKind: 'speed',
  spenderType: 'apiKey',
  spenderId: 'key-1',
  limitValue: 3,
  remaining: 0,
  windowSeconds: 60,
  retryAfterMs: 11983,
  periodEnd: null,
  isFallback: true,
  ...overrides,
});

const catchThrown = (
  exhaustedScope?: ExhaustedScope,
): UsageLimitHttpException => {
  try {
    usageLimitToRestApiExceptionHandler(
      new UsageLimitException(
        'Rate limit exceeded for apiKey: 3 requests per 60s.',
        UsageLimitExceptionCode.RATE_LIMITED,
        { exhaustedScope },
      ),
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
      scope: { spenderType: 'apiKey', spenderId: 'key-1' },
      limit: 3,
      remaining: 0,
      windowSeconds: 60,
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

  describe('quota exhaustion', () => {
    const periodEnd = new Date('2026-09-01T00:00:00.000Z');

    const catchQuotaThrown = (): UsageLimitHttpException => {
      try {
        usageLimitToRestApiExceptionHandler(
          new UsageLimitException(
            'Usage quota exhausted for workspace: 1000000 per period.',
            UsageLimitExceptionCode.QUOTA_EXHAUSTED,
            {
              exhaustedScope: buildExhaustedScope({
                limitKind: 'quota',
                spenderType: 'workspace',
                spenderId: null,
                limitValue: 1_000_000,
                windowSeconds: 0,
                retryAfterMs: 0,
                periodEnd,
              }),
            },
          ),
        );
      } catch (error) {
        return error as UsageLimitHttpException;
      }

      throw new Error('the handler was expected to throw');
    };

    it('answers 402, because retrying sooner cannot help', () => {
      const error = catchQuotaThrown();

      expect(error.getStatus()).toBe(HttpStatus.PAYMENT_REQUIRED);
      expect(error.getResponseBody()).toEqual({
        statusCode: HttpStatus.PAYMENT_REQUIRED,
        error: 'QUOTA_EXHAUSTED',
        messages: ['Usage quota exhausted for workspace: 1000000 per period.'],
        limitKind: 'quota',
        scope: { spenderType: 'workspace', spenderId: null },
        limit: 1_000_000,
        remaining: 0,
        periodEnd: periodEnd.toISOString(),
      });
    });

    it('sends no rate-limit headers', () => {
      expect(catchQuotaThrown().getResponseHeaders()).toEqual({});
    });
  });
});
