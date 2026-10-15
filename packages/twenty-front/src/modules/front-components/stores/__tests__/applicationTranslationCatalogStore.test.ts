import { ApolloClient, ApolloLink, InMemoryCache } from '@apollo/client';

import { getApplicationTranslationCatalogStore } from '@/front-components/stores/applicationTranslationCatalogStore';

it('reuses active catalogs and evicts them five minutes after their last subscriber leaves', async () => {
  jest.useFakeTimers({ doNotFake: ['queueMicrotask'] });
  const client = new ApolloClient({
    cache: new InMemoryCache(),
    link: ApolloLink.empty(),
  });
  const input = {
    client,
    workspaceId: 'workspace',
    applicationId: 'application',
    locale: 'en' as const,
  };
  try {
    const store = getApplicationTranslationCatalogStore(input);
    const unsubscribe = store.subscribe(jest.fn());
    await Promise.resolve();
    jest.advanceTimersByTime(6 * 60 * 1000);
    expect(getApplicationTranslationCatalogStore(input)).toBe(store);
    unsubscribe();
    jest.advanceTimersByTime(4 * 60 * 1000);
    expect(getApplicationTranslationCatalogStore(input)).toBe(store);
    jest.advanceTimersByTime(60 * 1000);
    expect(getApplicationTranslationCatalogStore(input)).not.toBe(store);
  } finally {
    client.stop();
    jest.useRealTimers();
  }
});
