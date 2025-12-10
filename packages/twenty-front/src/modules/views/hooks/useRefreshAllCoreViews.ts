import { FIND_ALL_CORE_VIEWS } from '@/views/graphql/queries/findAllCoreViews';
import { coreViewsState } from '@/views/states/coreViewState';
import { type FetchPolicy, useApolloClient } from '@apollo/client';
import { useRecoilCallback } from 'recoil';
import { isDefined } from 'twenty-shared/utils';
import { type FindAllCoreViewsQuery } from '~/generated/graphql';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';

export const useRefreshAllCoreViews = (
  fetchPolicy: FetchPolicy = 'network-only',
) => {
  const client = useApolloClient();

  const refreshAllCoreViews = useRecoilCallback(
    ({ snapshot, set }) =>
      async () => {
        const result = await client.query<FindAllCoreViewsQuery>({
          query: FIND_ALL_CORE_VIEWS,
          variables: {},
          fetchPolicy,
        });

        const currentCoreViews = snapshot
          .getLoadable(coreViewsState)
          .getValue();

        const coreViewsFromResult = result.data.getCoreViews;

        if (
          isDefined(result.data?.getCoreViews) &&
          !isDeeplyEqual(currentCoreViews, coreViewsFromResult)
        ) {
          set(coreViewsState, coreViewsFromResult);
        }

        return result.data?.getCoreViews;
      },
    [client, fetchPolicy],
  );

  return {
    refreshAllCoreViews,
  };
};
