import { isErrorLike } from '@apollo/client/errors';

// Rethrown by code whose failure the user has already seen a toast for, so catch sites higher up do not show it again.
export class AlreadyReportedError extends Error {
  constructor(cause: unknown) {
    super(isErrorLike(cause) ? cause.message : 'Already reported error', {
      cause,
    });
    this.name = 'AlreadyReportedError';
  }
}
