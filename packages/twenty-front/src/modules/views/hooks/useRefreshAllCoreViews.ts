import { FIND_ALL_CORE_VIEWS } from '@/views/graphql/queries/findAllCoreViews';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import { coreViewsState } from '@/views/states/coreViewState';
import { type FetchPolicy, useApolloClient } from '@apollo/client';
import { useCallback } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { type FindAllCoreViewsQuery } from '~/generated-metadata/graphql';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';

export const useRefreshAllCoreViews = (
  fetchPolicy: FetchPolicy = 'network-only',
) => {
  const client = useApolloClient();

  const refreshAllCoreViews = useCallback(async () => {
    const result = await client.query<FindAllCoreViewsQuery>({
      query: FIND_ALL_CORE_VIEWS,
      variables: {},
      fetchPolicy,
    });

    const currentCoreViews = jotaiStore.get(coreViewsState.atom);

    const coreViewsFromResult = result.data.getCoreViews;

    if (
      isDefined(result.data?.getCoreViews) &&
      !isDeeplyEqual(currentCoreViews, coreViewsFromResult)
    ) {
      jotaiStore.set(coreViewsState.atom, coreViewsFromResult);
    }

    return result.data?.getCoreViews;
  }, [client, fetchPolicy]);

  return {
    refreshAllCoreViews,
  };
};
