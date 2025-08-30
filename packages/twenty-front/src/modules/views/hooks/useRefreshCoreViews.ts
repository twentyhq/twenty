import { coreViewsByObjectMetadataIdFamilySelector } from '@/views/states/coreViewsByObjectMetadataIdFamilySelector';
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

        const coreViewsForObjectMetadataId = snapshot
          .getLoadable(
            coreViewsByObjectMetadataIdFamilySelector(objectMetadataId),
          )
          .getValue();

        if (
          isDefined(result.data?.getCoreViews) &&
          !isDeeplyEqual(coreViewsForObjectMetadataId, result.data.getCoreViews)
        ) {
          set(
            coreViewsByObjectMetadataIdFamilySelector(objectMetadataId),
            result.data.getCoreViews,
          );
        }
      },
    [findManyCoreViewsLazy],
  );

  return {
    refreshCoreViews,
  };
};
