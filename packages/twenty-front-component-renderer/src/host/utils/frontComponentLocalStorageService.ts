import { isDefined } from 'twenty-shared/utils';

import { buildFrontComponentLocalStorageNamespace } from '@/host/utils/buildFrontComponentLocalStorageNamespace';
import { buildFrontComponentLocalStorageNamespaceRange } from '@/host/utils/buildFrontComponentLocalStorageNamespaceRange';
import { openFrontComponentLocalStorageEntriesStore } from '@/host/utils/openFrontComponentLocalStorageEntriesStore';
import { promisifyIndexedDbRequest } from '@/host/utils/promisifyIndexedDbRequest';
import { toFrontComponentStorageError } from '@/host/utils/toFrontComponentStorageError';
import { watchIndexedDbTransactionCompletion } from '@/host/utils/watchIndexedDbTransactionCompletion';
import { type FrontComponentLocalStorageEntry } from '@/types/FrontComponentLocalStorageEntry';
import { type FrontComponentLocalStorageNamespace } from '@/types/FrontComponentLocalStorageNamespace';
import { assertNoFrontComponentLocalStorageViolation } from '@/utils/assertNoFrontComponentLocalStorageViolation';

export const frontComponentLocalStorageService = {
  snapshot: async (
    input: FrontComponentLocalStorageNamespace,
  ): Promise<Record<string, string>> => {
    try {
      const { store } =
        await openFrontComponentLocalStorageEntriesStore('readonly');

      const entries = await promisifyIndexedDbRequest<
        FrontComponentLocalStorageEntry[]
      >(
        store.getAll(
          buildFrontComponentLocalStorageNamespaceRange(
            buildFrontComponentLocalStorageNamespace(input),
          ),
        ),
      );

      return Object.fromEntries(entries.map(({ key, value }) => [key, value]));
    } catch (error) {
      throw toFrontComponentStorageError(error);
    }
  },

  set: async ({
    key,
    serializedValue,
    ...namespaceInput
  }: FrontComponentLocalStorageNamespace & {
    key: string;
    serializedValue: string;
  }): Promise<void> => {
    const namespace = buildFrontComponentLocalStorageNamespace(namespaceInput);

    try {
      const { store, transaction } =
        await openFrontComponentLocalStorageEntriesStore('readwrite');
      const transactionCompletion =
        watchIndexedDbTransactionCompletion(transaction);

      const entries = await promisifyIndexedDbRequest<
        FrontComponentLocalStorageEntry[]
      >(store.getAll(buildFrontComponentLocalStorageNamespaceRange(namespace)));

      const otherEntriesTotalLength = entries
        .filter((entry) => entry.key !== key)
        .reduce((total, entry) => total + entry.size, 0);

      try {
        assertNoFrontComponentLocalStorageViolation({
          key,
          serializedValue,
          otherEntriesTotalLength,
        });
      } catch (violationError) {
        transaction.abort();

        throw violationError;
      }

      const entry: FrontComponentLocalStorageEntry = {
        namespace,
        key,
        value: serializedValue,
        size: serializedValue.length,
        updatedAt: Date.now(),
      };

      store.put(entry);

      await transactionCompletion;
    } catch (error) {
      throw toFrontComponentStorageError(error);
    }
  },

  delete: async ({
    key,
    ...namespaceInput
  }: FrontComponentLocalStorageNamespace & {
    key: string;
  }): Promise<boolean> => {
    const namespace = buildFrontComponentLocalStorageNamespace(namespaceInput);

    try {
      const { store, transaction } =
        await openFrontComponentLocalStorageEntriesStore('readwrite');
      const transactionCompletion =
        watchIndexedDbTransactionCompletion(transaction);

      const existingEntry = await promisifyIndexedDbRequest<
        FrontComponentLocalStorageEntry | undefined
      >(store.get([namespace, key]));

      if (isDefined(existingEntry)) {
        store.delete([namespace, key]);
      }

      await transactionCompletion;

      return isDefined(existingEntry);
    } catch (error) {
      throw toFrontComponentStorageError(error);
    }
  },

  clear: async (input: FrontComponentLocalStorageNamespace): Promise<void> => {
    try {
      const { store, transaction } =
        await openFrontComponentLocalStorageEntriesStore('readwrite');
      const transactionCompletion =
        watchIndexedDbTransactionCompletion(transaction);

      store.delete(
        buildFrontComponentLocalStorageNamespaceRange(
          buildFrontComponentLocalStorageNamespace(input),
        ),
      );

      await transactionCompletion;
    } catch (error) {
      throw toFrontComponentStorageError(error);
    }
  },
};
