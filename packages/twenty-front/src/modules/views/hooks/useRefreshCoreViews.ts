import { coreViewsState } from '@/views/states/coreViewState';
import { useRecoilCallback } from 'recoil';
import { isDefined } from 'twenty-shared/utils';
import { useFindManyCoreViewsLazyQuery } from '~/generated/graphql';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';

export const useRefreshCoreViews = () => {
  const [findManyCoreViewsLazy] = useFindManyCoreViewsLazyQuery();

  const refreshCoreViews = useRecoilCallback(
    ({ snapshot, set }) =>
      async (objectMetadataId: string) => {
        const result = await findManyCoreViewsLazy({
          variables: {
            objectMetadataId,
          },
          fetchPolicy: 'network-only',
        });

        const existingCoreViews = snapshot
          .getLoadable(coreViewsState)
          .getValue();

        if (
          isDefined(result.data?.getCoreViews) &&
          !isDeeplyEqual(existingCoreViews, result.data.getCoreViews)
        ) {
          set(coreViewsState, result.data.getCoreViews);
        }
      },
    [findManyCoreViewsLazy],
  );

  return {
    refreshCoreViews,
  };
};
