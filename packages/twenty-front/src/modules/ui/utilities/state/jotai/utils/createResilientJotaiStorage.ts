import { createJSONStorage } from 'jotai/utils';

import { logError } from '~/utils/logError';

type ResilientJotaiStorage<ValueType> = ReturnType<
  typeof createJSONStorage<ValueType>
>;

// Web storage reads and writes can throw (quota exceeded on large workspaces,
// privacy modes, disabled storage). Persisted atoms are caches or
// preferences, never sources of truth, so a storage failure must degrade to
// in-memory state instead of crashing the app — an unhandled quota error
// during boot-time metadata persistence used to blank the whole app.
export const createResilientJotaiStorage = <ValueType>(
  getStringStorage: () => Storage,
): ResilientJotaiStorage<ValueType> => {
  const baseStorage = createJSONStorage<ValueType>(getStringStorage);

  return {
    ...baseStorage,
    getItem: (key, initialValue) => {
      try {
        return baseStorage.getItem(key, initialValue);
      } catch (error) {
        logError(
          `Failed to read "${key}" from storage; falling back to the initial value. ${error}`,
        );

        return initialValue;
      }
    },
    setItem: (key, newValue) => {
      try {
        baseStorage.setItem(key, newValue);
      } catch (error) {
        // Evict the key so an oversized stale copy doesn't linger and its
        // space is freed for other keys; state stays in memory this session.
        try {
          baseStorage.removeItem(key);
        } catch {
          // Storage is unavailable altogether; nothing left to clean up.
        }

        logError(
          `Failed to persist "${key}" to storage; continuing with in-memory state only. ${error}`,
        );
      }
    },
    removeItem: (key) => {
      try {
        baseStorage.removeItem(key);
      } catch (error) {
        logError(`Failed to remove "${key}" from storage. ${error}`);
      }
    },
  };
};
