import { FrontComponentStorageError } from '@/utils/FrontComponentStorageError';

export const toQuotaExceededDomException = (error: unknown): unknown =>
  error instanceof FrontComponentStorageError
    ? new DOMException(error.message, 'QuotaExceededError')
    : error;
