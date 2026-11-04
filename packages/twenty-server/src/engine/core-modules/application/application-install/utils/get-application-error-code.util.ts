import { ApplicationException } from 'src/engine/core-modules/application/application.exception';

export const getApplicationErrorCode = (error: unknown): string =>
  error instanceof ApplicationException ? error.code : 'UNKNOWN';
