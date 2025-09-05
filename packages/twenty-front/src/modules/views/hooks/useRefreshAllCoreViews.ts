import { coreViewsState } from '@/views/states/coreViewState';
import { type FetchPolicy, useApolloClient } from '@apollo/client';
import { useRecoilCallback } from 'recoil';
import { isDefined } from 'twenty-shared/utils';
import { type FindManyCoreViewsQuery } from '~/generated/graphql';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';
import { FIND_MANY_CORE_VIEWS } from '../graphql/queries/findManyCoreViews';

export const useRefreshAllCoreViews = (
  fetchPolicy: FetchPolicy = 'network-only',
) => {
  const client = useApolloClient();

  const refreshAllCoreViews = useRecoilCallback(
    ({ snapshot, set }) =>
      async () => {
        const result = await client.query<FindManyCoreViewsQuery>({
          query: FIND_MANY_CORE_VIEWS,
          variables: {},
          fetchPolicy,
        });

        const currentCoreViews = snapshot
          .getLoadable(coreViewsState)
          .getValue();

        if (
          isDefined(result.data?.getCoreViews) &&
          !isDeeplyEqual(currentCoreViews, result.data.getCoreViews)
        ) {
          set(coreViewsState, result.data.getCoreViews);
        }

        return result.data?.getCoreViews;
      },
    [client, fetchPolicy],
  );

  return {
    refreshAllCoreViews,
  };
};
