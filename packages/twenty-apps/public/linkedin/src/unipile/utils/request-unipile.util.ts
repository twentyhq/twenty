import { isNumber, isObject, isString } from '@sniptt/guards';

import { wait } from 'src/utils/wait.util';

const UNIPILE_RATE_LIMITED_STATUS = 429;

const UNIPILE_RATE_LIMIT_MAX_WAITS = 5;

const UNIPILE_RATE_LIMIT_DEFAULT_WAIT_SECONDS = 60;

const UNIPILE_RATE_LIMIT_MAX_WAIT_SECONDS = 120;

export class UnipileRequestError extends Error {
  readonly status: number | undefined;

  constructor(message: string, status: number | undefined) {
    super(message);
    this.name = 'UnipileRequestError';
    this.status = status;
  }
}

const toUnipileRequestError = (
  requestName: string,
  error: object,
): UnipileRequestError => {
  const { status, title, detail } = error as {
    status?: unknown;
    title?: unknown;
    detail?: unknown;
  };
  const reason = [title, detail].filter(isString).join(': ');

  return new UnipileRequestError(
    `Unipile ${requestName} failed${isNumber(status) ? ` (${status})` : ''}: ${reason || JSON.stringify(error)}`,
    isNumber(status) ? status : undefined,
  );
};

export class UnipileRateLimitError extends UnipileRequestError {
  readonly retryAfterSeconds: number;

  constructor(message: string, retryAfterSeconds: number) {
    super(message, UNIPILE_RATE_LIMITED_STATUS);
    this.name = 'UnipileRateLimitError';
    this.retryAfterSeconds = retryAfterSeconds;
  }
}

const SECONDS_BY_UNIT: Record<string, number> = {
  second: 1,
  minute: 60,
  hour: 60 * 60,
  day: 24 * 60 * 60,
};

const getRateLimitWaitSeconds = (error: UnipileRequestError): number => {
  const [, amount, unit] =
    /retry in (\d+) (second|minute|hour|day)s?/i.exec(error.message) ?? [];
  const retryAfterSeconds =
    Number(amount) * (SECONDS_BY_UNIT[unit?.toLowerCase() ?? ''] ?? NaN);

  return Number.isFinite(retryAfterSeconds) && retryAfterSeconds > 0
    ? retryAfterSeconds + 1
    : UNIPILE_RATE_LIMIT_DEFAULT_WAIT_SECONDS;
};

export const requestUnipile = async <TResult>(
  requestName: string,
  request: () => Promise<TResult>,
): Promise<TResult> => {
  for (let waitCount = 0; ; waitCount++) {
    try {
      return await request();
    } catch (error) {
      if (error instanceof Error || !isObject(error)) {
        throw error;
      }

      const requestError = toUnipileRequestError(requestName, error);
      const waitSeconds = getRateLimitWaitSeconds(requestError);

      if (requestError.status !== UNIPILE_RATE_LIMITED_STATUS) {
        throw requestError;
      }

      if (
        waitCount >= UNIPILE_RATE_LIMIT_MAX_WAITS ||
        waitSeconds > UNIPILE_RATE_LIMIT_MAX_WAIT_SECONDS
      ) {
        throw new UnipileRateLimitError(requestError.message, waitSeconds);
      }

      console.log(
        `[linkedin] Unipile ${requestName} rate limited, retrying in ${waitSeconds}s`,
      );

      await wait(waitSeconds * 1000);
    }
  }
};
