import { isDefined } from 'twenty-shared/utils';

import {
  type FrontComponentLocalStorageCache,
  type FrontComponentLocalStorageCacheMutation,
} from '@/types/FrontComponentLocalStorageCache';

export const createFrontComponentLocalStorageCache =
  (): FrontComponentLocalStorageCache => {
    const entries = new Map<string, string>();
    const committedEntries = new Map<string, string>();
    const pendingMutationCountByKey = new Map<string, number>();

    const startKeyMutations = (keys: string[]): void => {
      for (const key of keys) {
        pendingMutationCountByKey.set(
          key,
          (pendingMutationCountByKey.get(key) ?? 0) + 1,
        );
      }
    };

    const endKeyMutations = (keys: string[]): void => {
      for (const key of keys) {
        const remainingCount = (pendingMutationCountByKey.get(key) ?? 1) - 1;

        if (remainingCount <= 0) {
          pendingMutationCountByKey.delete(key);

          continue;
        }

        pendingMutationCountByKey.set(key, remainingCount);
      }
    };

    const getTrackedKeys = (): string[] =>
      Array.from(
        new Set([
          ...entries.keys(),
          ...committedEntries.keys(),
          ...pendingMutationCountByKey.keys(),
        ]),
      );

    const reconcileSettledKeys = (keys: string[]): void => {
      for (const key of keys) {
        if (pendingMutationCountByKey.has(key)) {
          continue;
        }

        const committedValue = committedEntries.get(key);

        if (isDefined(committedValue)) {
          entries.set(key, committedValue);

          continue;
        }

        entries.delete(key);
      }
    };

    const buildKeyMutation = (
      key: string,
      applyCommit: () => void,
    ): FrontComponentLocalStorageCacheMutation => ({
      commit: () => {
        applyCommit();
        endKeyMutations([key]);
        reconcileSettledKeys([key]);
      },
      rollback: () => {
        endKeyMutations([key]);
        reconcileSettledKeys([key]);
      },
    });

    return {
      getItem: (key) => entries.get(key) ?? null,
      getKeys: () => Array.from(entries.keys()),
      getKeyAtIndex: (index) => Array.from(entries.keys())[index] ?? null,
      getLength: () => entries.size,

      getOtherEntriesTotalLength: (excludedKey) => {
        let totalLength = 0;

        for (const [key, value] of entries) {
          if (key !== excludedKey) {
            totalLength += value.length;
          }
        }

        return totalLength;
      },

      seed: (seededEntries) => {
        entries.clear();
        committedEntries.clear();

        for (const [key, value] of Object.entries(seededEntries)) {
          entries.set(key, value);
          committedEntries.set(key, value);
        }
      },

      beginWrite: (key, serializedValue) => {
        entries.set(key, serializedValue);
        startKeyMutations([key]);

        return buildKeyMutation(key, () => {
          committedEntries.set(key, serializedValue);
        });
      },

      beginDelete: (key) => {
        const wasPresent = entries.delete(key);
        startKeyMutations([key]);

        return {
          wasPresent,
          ...buildKeyMutation(key, () => {
            committedEntries.delete(key);
          }),
        };
      },

      beginClear: () => {
        const affectedKeys = getTrackedKeys();

        entries.clear();
        startKeyMutations(affectedKeys);

        return {
          commit: () => {
            committedEntries.clear();
            endKeyMutations(affectedKeys);
            reconcileSettledKeys(getTrackedKeys());
          },
          rollback: () => {
            endKeyMutations(affectedKeys);
            reconcileSettledKeys(getTrackedKeys());
          },
        };
      },
    };
  };
