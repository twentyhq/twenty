import { useRecoilCallback } from 'recoil';

import { contextStoreCurrentViewIdComponentState } from '@/context-store/states/contextStoreCurrentViewIdComponentState';
import { useRecoilComponentCallbackState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackState';
import { useCanPersistViewChanges } from '@/views/hooks/useCanPersistViewChanges';
import { useRefreshCoreViewsByObjectMetadataId } from '@/views/hooks/useRefreshCoreViewsByObjectMetadataId';
import { coreViewFromViewIdFamilySelector } from '@/views/states/selectors/coreViewFromViewIdFamilySelector';
import { type GraphQLView } from '@/views/types/GraphQLView';
import { convertUpdateViewInputToCore } from '@/views/utils/convertUpdateViewInputToCore';
import { isDefined } from 'twenty-shared/utils';
import { useUpdateCoreViewMutation } from '~/generated-metadata/graphql';

export const useUpdateCurrentView = () => {
  const { canPersistChanges } = useCanPersistViewChanges();
  const currentViewIdCallbackState = useRecoilComponentCallbackState(
    contextStoreCurrentViewIdComponentState,
  );

  const { refreshCoreViewsByObjectMetadataId } =
    useRefreshCoreViewsByObjectMetadataId();

  const [updateOneCoreView] = useUpdateCoreViewMutation();

  const updateCurrentView = useRecoilCallback(
    ({ snapshot }) =>
      async (view: Partial<GraphQLView>) => {
        if (!canPersistChanges) {
          return;
        }

        const currentViewId = snapshot
          .getLoadable(currentViewIdCallbackState)
          .getValue();

        const currentView = snapshot
          .getLoadable(
            coreViewFromViewIdFamilySelector({
              viewId: currentViewId ?? '',
            }),
          )
          .getValue();

        if (!isDefined(currentView)) {
          return;
        }

        if (isDefined(currentViewId)) {
          const input = convertUpdateViewInputToCore(view);

          await updateOneCoreView({
            variables: {
              id: currentViewId,
              input,
            },
          });
          await refreshCoreViewsByObjectMetadataId(
            currentView.objectMetadataId,
          );
        }
      },
    [
      canPersistChanges,
      currentViewIdCallbackState,
      refreshCoreViewsByObjectMetadataId,
      updateOneCoreView,
    ],
  );

  return {
    updateCurrentView,
  };
};
