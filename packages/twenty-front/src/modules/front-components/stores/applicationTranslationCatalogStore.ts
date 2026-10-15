import { isString } from '@sniptt/guards';
import { type ApolloClient } from '@apollo/client';
import { SOURCE_LOCALE, type AppLocale } from 'twenty-shared/translations';
import { isPlainObject } from 'twenty-shared/utils';

import { GetApplicationTranslationCatalogDocument } from '~/generated-metadata/graphql';

type CatalogSnapshot = {
  translationCatalog: Record<string, string>;
  hasSettled: boolean;
};

type CatalogStore = {
  getSnapshot: () => CatalogSnapshot;
  subscribe: (listener: () => void) => () => void;
  invalidate: () => void;
};

const storesByClient = new WeakMap<ApolloClient, Map<string, CatalogStore>>();

const createCatalogStore = (
  load: () => Promise<Record<string, string>>,
): CatalogStore => {
  let snapshot: CatalogSnapshot = { translationCatalog: {}, hasSettled: false };
  const listeners = new Set<() => void>();
  let isFetching = false;
  let isScheduled = false;
  let isDirty = false;

  const refresh = async () => {
    isScheduled = false;
    if (isFetching || listeners.size === 0 || !isDirty) return;
    isFetching = true;
    isDirty = false;
    try {
      const translationCatalog = await load().catch(
        () => snapshot.translationCatalog,
      );
      snapshot = { translationCatalog, hasSettled: true };
      for (const listener of listeners) listener();
    } finally {
      isFetching = false;
      if (isDirty) schedule();
    }
  };

  const schedule = () => {
    if (isScheduled) return;
    isScheduled = true;
    queueMicrotask(() => {
      void refresh();
    });
  };
  const invalidate = () => {
    isDirty = true;
    schedule();
  };

  return {
    getSnapshot: () => snapshot,
    invalidate,
    subscribe: (listener) => {
      listeners.add(listener);
      if (listeners.size === 1) invalidate();
      return () => {
        listeners.delete(listener);
      };
    },
  };
};

export const getApplicationTranslationCatalogStore = ({
  client,
  workspaceId,
  applicationId,
  locale,
}: {
  client: ApolloClient;
  workspaceId: string | undefined;
  applicationId: string;
  locale: AppLocale;
}): CatalogStore => {
  let stores = storesByClient.get(client);
  if (!stores) {
    stores = new Map();
    storesByClient.set(client, stores);
  }
  const key = JSON.stringify([workspaceId, applicationId, locale]);
  let store = stores.get(key);
  if (!store) {
    // One ordered request stream per catalog, including invalidations received in flight.
    store = createCatalogStore(async () => {
      if (locale === SOURCE_LOCALE) return {};
      const result = await client.query({
        query: GetApplicationTranslationCatalogDocument,
        variables: { applicationId, locale },
        fetchPolicy: 'no-cache',
        context: { queryDeduplication: false },
      });
      const catalog: unknown = result.data?.applicationTranslationCatalog;
      const isCatalog = (value: unknown): value is Record<string, string> =>
        isPlainObject(value) && Object.values(value).every(isString);
      return isCatalog(catalog) ? catalog : {};
    });
    stores.set(key, store);
  }
  return store;
};
