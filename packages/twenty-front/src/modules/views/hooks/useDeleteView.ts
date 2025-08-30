import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useDeleteOneRecord } from '@/object-record/hooks/useDeleteOneRecord';
import { prefetchViewFromViewIdFamilySelector } from '@/prefetch/states/selector/prefetchViewFromViewIdFamilySelector';
import { useRefreshCoreViews } from '@/views/hooks/useRefreshCoreViews';
import { useFeatureFlagsMap } from '@/workspace/hooks/useFeatureFlagsMap';
import { useRecoilCallback } from 'recoil';
import { isDefined } from 'twenty-shared/utils';
import { FeatureFlagKey, useDeleteCoreViewMutation } from '~/generated/graphql';

export const useDeleteView = () => {
  const featureFlags = useFeatureFlagsMap();
  const isCoreViewEnabled = featureFlags[FeatureFlagKey.IS_CORE_VIEW_ENABLED];

  const [deleteCoreViewMutation] = useDeleteCoreViewMutation();
  const { refreshCoreViews } = useRefreshCoreViews();
  const { deleteOneRecord } = useDeleteOneRecord({
    objectNameSingular: CoreObjectNameSingular.View,
  });

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

        if (isCoreViewEnabled) {
          await deleteCoreViewMutation({
            variables: {
              id: viewId,
            },
          });

          await refreshCoreViews(currentView.objectMetadataId);
        } else {
          await deleteOneRecord(viewId);
        }
      },
    [
      deleteCoreViewMutation,
      deleteOneRecord,
      isCoreViewEnabled,
      refreshCoreViews,
    ],
  );

  return { deleteView };
};
