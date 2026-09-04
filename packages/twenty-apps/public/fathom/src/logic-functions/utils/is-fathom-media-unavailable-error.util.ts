import { FathomError } from 'fathom-typescript/sdk/models/errors';

const FORBIDDEN_STATUS_CODE = 403;
const UNPROCESSABLE_STATUS_CODE = 422;

// 422 is a recording with no downloadable media, 403 a limited-access share the
// connected account may view but not download. Neither is worth a retry.
export const isFathomMediaUnavailableError = (error: unknown): boolean =>
  error instanceof FathomError &&
  (error.statusCode === FORBIDDEN_STATUS_CODE ||
    error.statusCode === UNPROCESSABLE_STATUS_CODE);
