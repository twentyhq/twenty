import { prefetchViewFromViewIdFamilySelector } from '@/prefetch/states/selector/prefetchViewFromViewIdFamilySelector';
import { useRefreshCoreViews } from '@/views/hooks/useRefreshCoreViews';
import { useRecoilCallback } from 'recoil';
import { isDefined } from 'twenty-shared/utils';
import { useDeleteCoreViewMutation } from '~/generated/graphql';

export const useDeleteView = () => {
  const [deleteCoreViewMutation] = useDeleteCoreViewMutation();
  const { refreshCoreViews } = useRefreshCoreViews();

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

        await refreshCoreViews(currentView.objectMetadataId);
      },
    [deleteCoreViewMutation, refreshCoreViews],
  );

  return { deleteView };
};
