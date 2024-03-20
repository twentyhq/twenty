import { useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useRecoilCallback } from 'recoil';

import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useDeleteOneRecord } from '@/object-record/hooks/useDeleteOneRecord';
import { usePersistViewRecord } from '@/views/hooks/internal/usePersistViewRecord';
import { useViewStates } from '@/views/hooks/internal/useViewStates';
import { useResetCurrentView } from '@/views/hooks/useResetCurrentView';
import { GraphQLView } from '@/views/types/GraphQLView';
import { isDefined } from '~/utils/isDefined';

export const useHandleViews = (viewBarComponentId?: string) => {
  const { updateViewRecord } = usePersistViewRecord();
  const { resetCurrentView } = useResetCurrentView(viewBarComponentId);

  const { currentViewIdState } = useViewStates(viewBarComponentId);

  const { deleteOneRecord } = useDeleteOneRecord({
    objectNameSingular: CoreObjectNameSingular.View,
  });

  const createEmptyView = useRecoilCallback(() => () => {}, []);
  const createViewFromCurrent = useRecoilCallback(() => () => {}, []);

  const [_, setSearchParams] = useSearchParams();

  const removeView = useRecoilCallback(
    () => (viewId: string) => {
      deleteOneRecord(viewId);
    },
    [deleteOneRecord],
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
          await updateViewRecord({ ...view, id: currentViewId });
        }
      },
    [currentViewIdState, updateViewRecord],
  );

  return {
    selectView,
    updateCurrentView,
    removeView,
    createEmptyView,
    createViewFromCurrent,
  };
};
