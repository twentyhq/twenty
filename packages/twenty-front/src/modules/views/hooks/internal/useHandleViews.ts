import { useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useRecoilCallback } from 'recoil';

import { useHandleCurrentViewFilterAndSorts } from '@/views/hooks/internal/useHandleCurrentViewFilterAndSorts';
import { usePersistViewRecord } from '@/views/hooks/internal/usePersistViewRecord';
import { useViewStates } from '@/views/hooks/internal/useViewStates';
import { GraphQLView } from '@/views/types/GraphQLView';
import { isDefined } from '~/utils/isDefined';

export const useHandleViews = (viewBarComponentId?: string) => {
  const { updateViewRecord } = usePersistViewRecord();
  const { resetCurrentViewFilterAndSorts } =
    useHandleCurrentViewFilterAndSorts(viewBarComponentId);

  const { currentViewIdState } = useViewStates(viewBarComponentId);

  const removeView = useRecoilCallback(() => () => {}, []);
  const createEmptyView = useRecoilCallback(() => () => {}, []);
  const createViewFromCurrent = useRecoilCallback(() => () => {}, []);

  const [_, setSearchParams] = useSearchParams();

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
        resetCurrentViewFilterAndSorts();
      },
    [changeViewInUrl, currentViewIdState, resetCurrentViewFilterAndSorts],
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
