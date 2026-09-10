import { FathomError } from 'fathom-typescript/sdk/models/errors';

const NOT_FOUND_STATUS_CODE = 404;

export const isFathomNotFoundError = (error: unknown): boolean =>
  error instanceof FathomError && error.statusCode === NOT_FOUND_STATUS_CODE;
