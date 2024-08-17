import { useLastVisitedPage } from '@/navigation/hooks/useLastVisitedPage';
import { useViewFromQueryParams } from '@/views/hooks/internal/useViewFromQueryParams';
import { useViewStates } from '@/views/hooks/internal/useViewStates';
import { useGetCurrentView } from '@/views/hooks/useGetCurrentView';
import { isUndefined } from '@sniptt/guards';
import { useEffect } from 'react';
import { useRecoilState } from 'recoil';
import { isDefined } from '~/utils/isDefined';

export const QueryParamsViewIdEffect = () => {
  const { getFiltersFromQueryParams, viewIdQueryParam } =
    useViewFromQueryParams();
  const { currentViewIdState, componentId } = useViewStates();

  const [currentViewId, setCurrentViewId] = useRecoilState(currentViewIdState);
  const { viewsOnCurrentObject } = useGetCurrentView();
  const { getLastVisitedViewId } = useLastVisitedPage();
  const lastVisitedViewId = getLastVisitedViewId(componentId);
  useEffect(() => {
    const indexView = viewsOnCurrentObject.find((view) => view.key === 'INDEX');

    if (isUndefined(viewIdQueryParam) && isDefined(lastVisitedViewId)) {
      setCurrentViewId(lastVisitedViewId);
      return;
    }

    if (isDefined(viewIdQueryParam)) {
      setCurrentViewId(viewIdQueryParam);
      return;
    }

    if (isDefined(indexView)) {
      setCurrentViewId(indexView.id);
      return;
    }
  }, [
    currentViewId,
    getFiltersFromQueryParams,
    lastVisitedViewId,
    setCurrentViewId,
    viewIdQueryParam,
    viewsOnCurrentObject,
  ]);

  return <></>;
};
