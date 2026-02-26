import { FIND_ALL_CORE_VIEWS } from '@/views/graphql/queries/findAllCoreViews';
import { coreViewsState } from '@/views/states/coreViewState';
import { type FetchPolicy, useApolloClient } from '@apollo/client';
import { useCallback } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { type FindAllCoreViewsQuery } from '~/generated-metadata/graphql';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';
import { useStore } from 'jotai';

export const useRefreshAllCoreViews = (
  fetchPolicy: FetchPolicy = 'network-only',
) => {
  const store = useStore();
  const client = useApolloClient();

  const refreshAllCoreViews = useCallback(async () => {
    const result = await client.query<FindAllCoreViewsQuery>({
      query: FIND_ALL_CORE_VIEWS,
      variables: {},
      fetchPolicy,
    });

    const currentCoreViews = store.get(coreViewsState.atom);

    const coreViewsFromResult = result.data.getCoreViews;

    if (
      isDefined(result.data?.getCoreViews) &&
      !isDeeplyEqual(currentCoreViews, coreViewsFromResult)
    ) {
      store.set(coreViewsState.atom, coreViewsFromResult);
    }

    return result.data?.getCoreViews;
  }, [client, fetchPolicy, store]);

  return {
    refreshAllCoreViews,
  };
};
