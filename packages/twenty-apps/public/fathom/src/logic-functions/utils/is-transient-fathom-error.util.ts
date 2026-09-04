import {
  FathomError,
  HTTPClientError,
} from 'fathom-typescript/sdk/models/errors';

const TOO_MANY_REQUESTS_STATUS_CODE = 429;
const SERVER_ERROR_STATUS_CODE_LOWER_BOUND = 500;

export const isTransientFathomError = (error: unknown): boolean =>
  error instanceof HTTPClientError ||
  (error instanceof FathomError &&
    (error.statusCode === TOO_MANY_REQUESTS_STATUS_CODE ||
      error.statusCode >= SERVER_ERROR_STATUS_CODE_LOWER_BOUND));
