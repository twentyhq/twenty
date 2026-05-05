import { createJSONStorage } from 'jotai/utils';

// Creates a localStorage adapter that gracefully handles QuotaExceededError.
// Safari enforces a strict 5MB limit, and the metadata store can exceed it
// during reload transitions when both current and draft data coexist.
export const createSafeLocalStorage = <ValueType>() =>
  createJSONStorage<ValueType>(() => ({
    getItem: (key: string) => localStorage.getItem(key),
    setItem: (key: string, value: string) => {
      try {
        localStorage.setItem(key, value);
      } catch (error) {
        if (
          error instanceof DOMException &&
          (error.name === 'QuotaExceededError' ||
            error.code === DOMException.QUOTA_EXCEEDED_ERR)
        ) {
          return;
        }

        throw error;
      }
    },
    removeItem: (key: string) => localStorage.removeItem(key),
  }));
