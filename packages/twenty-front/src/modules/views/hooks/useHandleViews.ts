import { useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useRecoilCallback } from 'recoil';
import { v4 } from 'uuid';

import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useCreateOneRecord } from '@/object-record/hooks/useCreateOneRecord';
import { useDeleteOneRecord } from '@/object-record/hooks/useDeleteOneRecord';
import { useUpdateOneRecord } from '@/object-record/hooks/useUpdateOneRecord';
import { getSnapshotValue } from '@/ui/utilities/recoil-scope/utils/getSnapshotValue';
import { useRecoilInstanceCallbackState } from '@/ui/utilities/state/instance/hooks/useRecoilInstanceCallbackState';
import { usePersistViewFieldRecords } from '@/views/hooks/internal/usePersistViewFieldRecords';
import { useGetViewFromCache } from '@/views/hooks/useGetViewFromCache';
import { useResetCurrentView } from '@/views/hooks/useResetCurrentView';
import { useSaveCurrentViewFiltersAndSorts } from '@/views/hooks/useSaveCurrentViewFiltersAndSorts';
import { currentViewIdInstanceState } from '@/views/states/currentViewIdInstanceState';
import { isPersistingViewFieldsInstanceState } from '@/views/states/isPersistingViewFieldsInstanceState';
import { GraphQLView } from '@/views/types/GraphQLView';
import { View } from '@/views/types/View';
import { isDefined } from '~/utils/isDefined';
import { isUndefinedOrNull } from '~/utils/isUndefinedOrNull';

// TODO: split this hook into smaller hooks
export const useHandleViews = (viewBarComponentId?: string) => {
  const { resetCurrentView } = useResetCurrentView(viewBarComponentId);

  const currentViewIdCallbackState = useRecoilInstanceCallbackState(
    currentViewIdInstanceState,
    viewBarComponentId,
  );

  const isPersistingViewFieldsCallbackState = useRecoilInstanceCallbackState(
    isPersistingViewFieldsInstanceState,
    viewBarComponentId,
  );

  const { getViewFromCache } = useGetViewFromCache();

  const { deleteOneRecord } = useDeleteOneRecord({
    objectNameSingular: CoreObjectNameSingular.View,
  });

  const { createOneRecord } = useCreateOneRecord<View>({
    objectNameSingular: CoreObjectNameSingular.View,
  });

  const { updateOneRecord } = useUpdateOneRecord({
    objectNameSingular: CoreObjectNameSingular.View,
  });

  const { createViewFieldRecords } = usePersistViewFieldRecords();
  const { saveCurrentViewFilterAndSorts } =
    useSaveCurrentViewFiltersAndSorts(viewBarComponentId);

  const [, setSearchParams] = useSearchParams();

  const removeView = useRecoilCallback(
    () => async (viewId: string) => {
      await deleteOneRecord(viewId);
    },
    [deleteOneRecord],
  );

  const createView = useRecoilCallback(
    ({ snapshot, set }) =>
      async ({
        id,
        name,
        icon,
        kanbanFieldMetadataId,
        type,
      }: Partial<
        Pick<
          GraphQLView,
          'id' | 'name' | 'icon' | 'kanbanFieldMetadataId' | 'type'
        >
      >) => {
        const currentViewId = getSnapshotValue(
          snapshot,
          currentViewIdCallbackState,
        );

        if (!isDefined(currentViewId)) {
          return;
        }

        const view = await getViewFromCache(currentViewId);

        if (!isDefined(view)) {
          return;
        }

        set(isPersistingViewFieldsCallbackState, true);

        const newView = await createOneRecord({
          id: id ?? v4(),
          name: name ?? view.name,
          icon: icon ?? view.icon,
          key: null,
          kanbanFieldMetadataId:
            kanbanFieldMetadataId ?? view.kanbanFieldMetadataId,
          type: type ?? view.type,
          objectMetadataId: view.objectMetadataId,
        });

        if (isUndefinedOrNull(newView)) {
          throw new Error('Failed to create view');
        }

        await createViewFieldRecords(view.viewFields, newView);
        await saveCurrentViewFilterAndSorts(newView.id);
        set(isPersistingViewFieldsCallbackState, false);
      },
    [
      createOneRecord,
      createViewFieldRecords,
      currentViewIdCallbackState,
      getViewFromCache,
      isPersistingViewFieldsCallbackState,
      saveCurrentViewFilterAndSorts,
    ],
  );

  const changeViewInUrl = useCallback(
    (viewId: string) => {
      setSearchParams(() => {
        const searchParams = new URLSearchParams();
        searchParams.set('view', viewId);
        return searchParams;
      });
    },
    [setSearchParams],
  );

  const selectView = async (viewId: string) => {
    changeViewInUrl(viewId);
    resetCurrentView();
  };

  const updateCurrentView = useRecoilCallback(
    ({ snapshot }) =>
      async (view: Partial<GraphQLView>) => {
        const currentViewId = snapshot
          .getLoadable(currentViewIdCallbackState)
          .getValue();

        if (isDefined(currentViewId)) {
          await updateOneRecord({
            idToUpdate: currentViewId,
            updateOneRecordInput: view,
          });
        }
      },
    [currentViewIdCallbackState, updateOneRecord],
  );

  const updateView = useRecoilCallback(
    () => async (view: Partial<GraphQLView>) => {
      if (isDefined(view.id)) {
        await updateOneRecord({
          idToUpdate: view.id,
          updateOneRecordInput: view,
        });
      }
    },
    [updateOneRecord],
  );

  return {
    selectView,
    updateCurrentView,
    updateView,
    removeView,
    createView,
  };
};
