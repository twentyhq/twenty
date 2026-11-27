import { isDefined } from 'twenty-shared/utils';

export const createSourceFetcherWithOptionalPrefetch = <TSource>({
  shouldPrefetch,
  fetchSource,
}: {
  shouldPrefetch: boolean;
  fetchSource: () => Promise<TSource>;
}) => {
  const prefetchedSourceSettledPromise = shouldPrefetch
    ? Promise.allSettled([fetchSource()])
    : undefined;

  return async (): Promise<TSource> => {
    if (!isDefined(prefetchedSourceSettledPromise)) {
      return fetchSource();
    }

    const [prefetchedSourceSettledResult] =
      await prefetchedSourceSettledPromise;

    if (prefetchedSourceSettledResult.status === 'rejected') {
      throw prefetchedSourceSettledResult.reason;
    }

    return prefetchedSourceSettledResult.value;
  };
};
