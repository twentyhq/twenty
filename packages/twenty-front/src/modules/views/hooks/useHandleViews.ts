import { useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useRecoilCallback } from 'recoil';
import { v4 } from 'uuid';

import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useCreateOneRecord } from '@/object-record/hooks/useCreateOneRecord';
import { useDeleteOneRecord } from '@/object-record/hooks/useDeleteOneRecord';
import { useUpdateOneRecord } from '@/object-record/hooks/useUpdateOneRecord';
import { getSnapshotValue } from '@/ui/utilities/recoil-scope/utils/getSnapshotValue';
import { usePersistViewFieldRecords } from '@/views/hooks/internal/usePersistViewFieldRecords';
import { useViewStates } from '@/views/hooks/internal/useViewStates';
import { useGetViewFromCache } from '@/views/hooks/useGetViewFromCache';
import { useResetCurrentView } from '@/views/hooks/useResetCurrentView';
import { GraphQLView } from '@/views/types/GraphQLView';
import { isDefined } from '~/utils/isDefined';
import { isUndefinedOrNull } from '~/utils/isUndefinedOrNull';

export const useHandleViews = (viewBarComponentId?: string) => {
  const { resetCurrentView } = useResetCurrentView(viewBarComponentId);

  const { currentViewIdState } = useViewStates(viewBarComponentId);

  const { getViewFromCache } = useGetViewFromCache();

  const { deleteOneRecord } = useDeleteOneRecord({
    objectNameSingular: CoreObjectNameSingular.View,
  });

  const { createOneRecord } = useCreateOneRecord<GraphQLView>({
    objectNameSingular: CoreObjectNameSingular.View,
  });

  const { updateOneRecord } = useUpdateOneRecord({
    objectNameSingular: CoreObjectNameSingular.View,
  });

  const { createViewFieldRecords } = usePersistViewFieldRecords();

  const createViewFromCurrent = useRecoilCallback(() => () => {}, []);

  const [_, setSearchParams] = useSearchParams();

  const removeView = useRecoilCallback(
    () => async (viewId: string) => {
      await deleteOneRecord(viewId);
    },
    [deleteOneRecord],
  );

  const createEmptyView = useRecoilCallback(
    ({ snapshot }) =>
      async (id: string, name: string) => {
        const currentViewId = getSnapshotValue(snapshot, currentViewIdState);

        if (!isDefined(currentViewId)) {
          return;
        }

        const view = await getViewFromCache(currentViewId);

        if (!isDefined(view)) {
          return;
        }

        const newView = await createOneRecord({
          id: id ?? v4(),
          name: name,
          objectMetadataId: view.objectMetadataId,
          type: view.type,
        });

        if (isUndefinedOrNull(newView)) {
          throw new Error('Failed to create view');
        }

        await createViewFieldRecords(view.viewFields, newView);
      },
    [
      createOneRecord,
      createViewFieldRecords,
      currentViewIdState,
      getViewFromCache,
    ],
  );

  const changeViewInUrl = useCallback(
    (viewId: string) => {
      setSearchParams((previousSearchParams) => {
        previousSearchParams.set('view', viewId);
        return previousSearchParams;
      });
    },
    [setSearchParams],
  );

  const selectView = useRecoilCallback(
    ({ set }) =>
      async (viewId: string) => {
        set(currentViewIdState, viewId);
        changeViewInUrl(viewId);
        resetCurrentView();
      },
    [changeViewInUrl, currentViewIdState, resetCurrentView],
  );

  const updateCurrentView = useRecoilCallback(
    ({ snapshot }) =>
      async (view: Partial<GraphQLView>) => {
        const currentViewId = snapshot
          .getLoadable(currentViewIdState)
          .getValue();
        if (isDefined(currentViewId)) {
          await updateOneRecord({
            idToUpdate: currentViewId,
            updateOneRecordInput: view,
          });
        }
      },
    [currentViewIdState, updateOneRecord],
  );

  return {
    selectView,
    updateCurrentView,
    removeView,
    createEmptyView,
    createViewFromCurrent,
  };
};
