import { GranolaApiError } from 'src/logic-functions/types/granola-api-error';

export const isGranolaScopeValidationError = (error: unknown): boolean =>
  error instanceof GranolaApiError &&
  error.status === 400 &&
  error.details.some((detail) => detail.field === 'scopes');
