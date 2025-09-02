import { prefetchViewFromViewIdFamilySelector } from '@/prefetch/states/selector/prefetchViewFromViewIdFamilySelector';
import { useRefreshCoreViewsByObjectMetadataId } from '@/views/hooks/useRefreshCoreViewsByObjectMetadataId';
import { useRecoilCallback } from 'recoil';
import { isDefined } from 'twenty-shared/utils';
import { useDeleteCoreViewMutation } from '~/generated/graphql';

export const useDeleteView = () => {
  const [deleteCoreViewMutation] = useDeleteCoreViewMutation();
  const { refreshCoreViewsByObjectMetadataId } =
    useRefreshCoreViewsByObjectMetadataId();

  const deleteView = useRecoilCallback(
    ({ snapshot }) =>
      async (viewId: string) => {
        const currentView = snapshot
          .getLoadable(
            prefetchViewFromViewIdFamilySelector({
              viewId,
            }),
          )
          .getValue();

        if (!isDefined(currentView)) {
          return;
        }

        await deleteCoreViewMutation({
          variables: {
            id: viewId,
          },
        });

        await refreshCoreViewsByObjectMetadataId(currentView.objectMetadataId);
      },
    [deleteCoreViewMutation, refreshCoreViewsByObjectMetadataId],
  );

  return { deleteView };
};
