import { useRecoilCallback, useSetRecoilState } from 'recoil';

import { useContextStoreObjectMetadataItemOrThrow } from '@/context-store/hooks/useContextStoreObjectMetadataItemOrThrow';
import { contextStoreCurrentViewIdComponentState } from '@/context-store/states/contextStoreCurrentViewIdComponentState';
import { useLoadRecordIndexStates } from '@/object-record/record-index/hooks/useLoadRecordIndexStates';
import { recordIndexViewTypeState } from '@/object-record/record-index/states/recordIndexViewTypeState';
import { useRecoilComponentCallbackState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackState';
import { useCanPersistViewChanges } from '@/views/hooks/useCanPersistViewChanges';
import { useRefreshCoreViewsByObjectMetadataId } from '@/views/hooks/useRefreshCoreViewsByObjectMetadataId';
import useViewsSideEffectsOnViewGroups from '@/views/hooks/useViewsSideEffectsOnViewGroups';
import { coreViewFromViewIdFamilySelector } from '@/views/states/selectors/coreViewFromViewIdFamilySelector';
import { type GraphQLView } from '@/views/types/GraphQLView';
import { type ViewType } from '@/views/types/ViewType';
import { convertUpdateViewInputToCore } from '@/views/utils/convertUpdateViewInputToCore';
import { isDefined } from 'twenty-shared/utils';
import { useUpdateCoreViewMutation } from '~/generated-metadata/graphql';

export const useUpdateCurrentView = () => {
  const { canPersistChanges } = useCanPersistViewChanges();
  const currentViewIdCallbackState = useRecoilComponentCallbackState(
    contextStoreCurrentViewIdComponentState,
  );
  const { objectMetadataItem } = useContextStoreObjectMetadataItemOrThrow();
  const { loadRecordIndexStates } = useLoadRecordIndexStates();
  const setRecordIndexViewType = useSetRecoilState(recordIndexViewTypeState);

  const [updateOneCoreView] = useUpdateCoreViewMutation();
  const { refreshCoreViewsByObjectMetadataId } =
    useRefreshCoreViewsByObjectMetadataId();
  const { getViewGroupsToCreateAtViewUpdate } =
    useViewsSideEffectsOnViewGroups();

  const updateCurrentView = useRecoilCallback(
    ({ snapshot }) =>
      async (view: Partial<GraphQLView> & { type?: ViewType }) => {
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
            input.mainGroupByFieldMetadataId !== undefined &&
            currentView.mainGroupByFieldMetadataId !==
              input.mainGroupByFieldMetadataId
          ) {
            const { viewGroupsToCreate } = getViewGroupsToCreateAtViewUpdate({
              existingView: currentView,
              objectMetadataItemId: currentView.objectMetadataId,
              newMainGroupByFieldMetadataId: input.mainGroupByFieldMetadataId,
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

          if (isDefined(view.type)) {
            setRecordIndexViewType(view.type);
          }

          await refreshCoreViewsByObjectMetadataId(
            currentView.objectMetadataId,
          );
        }
      },
    [
      canPersistChanges,
      currentViewIdCallbackState,
      getViewGroupsToCreateAtViewUpdate,
      loadRecordIndexStates,
      objectMetadataItem,
      refreshCoreViewsByObjectMetadataId,
      setRecordIndexViewType,
      updateOneCoreView,
    ],
  );

  return {
    updateCurrentView,
  };
};
