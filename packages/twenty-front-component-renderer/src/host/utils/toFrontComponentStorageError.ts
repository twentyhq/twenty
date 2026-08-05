import { FrontComponentStorageError } from '@/utils/FrontComponentStorageError';

export const toFrontComponentStorageError = (
  error: unknown,
): FrontComponentStorageError => {
  if (error instanceof FrontComponentStorageError) {
    return error;
  }

  if (error instanceof DOMException && error.name === 'QuotaExceededError') {
    return new FrontComponentStorageError(
      'The browser storage quota is exhausted',
      'FRONT_COMPONENT_STORAGE_QUOTA_EXCEEDED',
    );
  }

  return new FrontComponentStorageError(
    'Device storage is unavailable',
    'FRONT_COMPONENT_STORAGE_UNAVAILABLE',
  );
};
