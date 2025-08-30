import { useRecoilCallback } from 'recoil';

import { contextStoreCurrentViewIdComponentState } from '@/context-store/states/contextStoreCurrentViewIdComponentState';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useUpdateOneRecord } from '@/object-record/hooks/useUpdateOneRecord';
import { prefetchViewFromViewIdFamilySelector } from '@/prefetch/states/selector/prefetchViewFromViewIdFamilySelector';
import { useRecoilComponentCallbackState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackState';
import { useRefreshCoreViews } from '@/views/hooks/useRefreshCoreViews';
import { type GraphQLView } from '@/views/types/GraphQLView';
import { convertUpdateViewInputToCore } from '@/views/utils/convertUpdateViewInputToCore';
import { useFeatureFlagsMap } from '@/workspace/hooks/useFeatureFlagsMap';
import { isDefined } from 'twenty-shared/utils';
import { useUpdateCoreViewMutation } from '~/generated-metadata/graphql';
import { FeatureFlagKey } from '~/generated/graphql';

export const useUpdateCurrentView = () => {
  const currentViewIdCallbackState = useRecoilComponentCallbackState(
    contextStoreCurrentViewIdComponentState,
  );

  const featureFlagMap = useFeatureFlagsMap();
  const isCoreViewEnabled = featureFlagMap[FeatureFlagKey.IS_CORE_VIEW_ENABLED];

  const { updateOneRecord } = useUpdateOneRecord({
    objectNameSingular: CoreObjectNameSingular.View,
  });
  const { refreshCoreViews } = useRefreshCoreViews();

  const [updateOneCoreView] = useUpdateCoreViewMutation();

  const updateCurrentView = useRecoilCallback(
    ({ snapshot }) =>
      async (view: Partial<GraphQLView>) => {
        const currentViewId = snapshot
          .getLoadable(currentViewIdCallbackState)
          .getValue();

        const currentView = snapshot
          .getLoadable(
            prefetchViewFromViewIdFamilySelector({
              viewId: currentViewId ?? '',
            }),
          )
          .getValue();

        if (!isDefined(currentView)) {
          return;
        }

        if (isDefined(currentViewId)) {
          if (isCoreViewEnabled) {
            const input = convertUpdateViewInputToCore(view);

            await updateOneCoreView({
              variables: {
                id: currentViewId,
                input,
              },
            });
            await refreshCoreViews(currentView.objectMetadataId);
          } else {
            await updateOneRecord({
              idToUpdate: currentViewId,
              updateOneRecordInput: view,
            });
          }
        }
      },
    [
      currentViewIdCallbackState,
      isCoreViewEnabled,
      refreshCoreViews,
      updateOneCoreView,
      updateOneRecord,
    ],
  );

  return {
    updateCurrentView,
  };
};
