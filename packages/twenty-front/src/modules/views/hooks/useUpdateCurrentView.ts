import { useRecoilCallback } from 'recoil';

import { useContextStoreObjectMetadataItemOrThrow } from '@/context-store/hooks/useContextStoreObjectMetadataItemOrThrow';
import { contextStoreCurrentViewIdComponentState } from '@/context-store/states/contextStoreCurrentViewIdComponentState';
import { useLoadRecordIndexStates } from '@/object-record/record-index/hooks/useLoadRecordIndexStates';
import { useRecoilComponentCallbackState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackState';
import { useCanPersistViewChanges } from '@/views/hooks/useCanPersistViewChanges';
import { useRefreshCoreViewsByObjectMetadataId } from '@/views/hooks/useRefreshCoreViewsByObjectMetadataId';
import useViewGroupsSideEffect from '@/views/hooks/useViewGroupsSideEffect';
import { coreViewFromViewIdFamilySelector } from '@/views/states/selectors/coreViewFromViewIdFamilySelector';
import { type GraphQLView } from '@/views/types/GraphQLView';
import { convertUpdateViewInputToCore } from '@/views/utils/convertUpdateViewInputToCore';
import { isDefined } from 'twenty-shared/utils';
import { useUpdateCoreViewMutation } from '~/generated-metadata/graphql';

export const useUpdateCurrentView = () => {
  const { canPersistChanges } = useCanPersistViewChanges();
  const { triggerViewGroupSideEffectAtViewUpdate } = useViewGroupsSideEffect();
  const currentViewIdCallbackState = useRecoilComponentCallbackState(
    contextStoreCurrentViewIdComponentState,
  );
  const { objectMetadataItem } = useContextStoreObjectMetadataItemOrThrow();
  const { loadRecordIndexStates } = useLoadRecordIndexStates();

  const [updateOneCoreView] = useUpdateCoreViewMutation();
  const { refreshCoreViewsByObjectMetadataId } =
    useRefreshCoreViewsByObjectMetadataId();

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

          if (
            isDefined(input.mainGroupByFieldMetadataId) &&
            currentView.mainGroupByFieldMetadataId !==
              input.mainGroupByFieldMetadataId
          ) {
            const { viewGroupsToCreate } =
              triggerViewGroupSideEffectAtViewUpdate({
                newViewId: currentViewId,
                objectMetadataItemId: currentView.objectMetadataId,
                mainGroupByFieldMetadataId: input.mainGroupByFieldMetadataId,
              });

            loadRecordIndexStates(
              {
                ...currentView,
                mainGroupByFieldMetadataId: input.mainGroupByFieldMetadataId,
                viewGroups: viewGroupsToCreate ?? [],
              },
              objectMetadataItem,
            );
          }

          await refreshCoreViewsByObjectMetadataId(
            currentView.objectMetadataId,
          );
        }
      },
    [
      canPersistChanges,
      currentViewIdCallbackState,
      loadRecordIndexStates,
      objectMetadataItem,
      refreshCoreViewsByObjectMetadataId,
      triggerViewGroupSideEffectAtViewUpdate,
      updateOneCoreView,
    ],
  );

  return {
    updateCurrentView,
  };
};
