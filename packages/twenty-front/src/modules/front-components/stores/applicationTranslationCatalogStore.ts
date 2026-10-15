import { type ApolloClient } from '@apollo/client';
import { isString } from '@sniptt/guards';
import { SOURCE_LOCALE, type AppLocale } from 'twenty-shared/translations';
import { isDefined, isPlainObject } from 'twenty-shared/utils';

import {
  createApplicationTranslationCatalogStore,
  type ApplicationTranslationCatalogStore,
} from '@/front-components/utils/createApplicationTranslationCatalogStore';
import { GetApplicationTranslationCatalogDocument } from '~/generated-metadata/graphql';

const storesByClient = new WeakMap<
  ApolloClient,
  Map<string, ApplicationTranslationCatalogStore>
>();

const isCatalog = (value: unknown): value is Record<string, string> =>
  isPlainObject(value) && Object.values(value).every(isString);

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
}): ApplicationTranslationCatalogStore => {
  const stores =
    storesByClient.get(client) ??
    new Map<string, ApplicationTranslationCatalogStore>();
  storesByClient.set(client, stores);
  const key = JSON.stringify([workspaceId, applicationId, locale]);
  const existingStore = stores.get(key);
  if (isDefined(existingStore)) {
    return existingStore;
  }

  const store = createApplicationTranslationCatalogStore({
    load: async () => {
      if (locale === SOURCE_LOCALE) {
        return {};
      }
      const result = await client.query({
        query: GetApplicationTranslationCatalogDocument,
        variables: { applicationId, locale },
        fetchPolicy: 'no-cache',
        context: { queryDeduplication: false },
      });
      const catalog: unknown = result.data?.applicationTranslationCatalog;
      return isCatalog(catalog) ? catalog : {};
    },
    onUnused: () => {
      if (stores.get(key) === store) {
        stores.delete(key);
      }
    },
  });
  stores.set(key, store);
  return store;
};
