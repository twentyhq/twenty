import { useEffect } from 'react';
import { isUndefined } from '@sniptt/guards';
import { useRecoilState } from 'recoil';

import { useViewFromQueryParams } from '@/views/hooks/internal/useViewFromQueryParams';
import { useViewStates } from '@/views/hooks/internal/useViewStates';
import { useGetCurrentView } from '@/views/hooks/useGetCurrentView';
import { isDefined } from '~/utils/isDefined';

export const QueryParamsViewIdEffect = () => {
  const { getFiltersFromQueryParams, viewIdQueryParam } =
    useViewFromQueryParams();
  const { currentViewIdState } = useViewStates();

  const [currentViewId, setCurrentViewId] = useRecoilState(currentViewIdState);
  const { viewsOnCurrentObject } = useGetCurrentView();

  useEffect(() => {
    const indexView = viewsOnCurrentObject.find((view) => view.key === 'INDEX');

    if (isUndefined(viewIdQueryParam) && isDefined(indexView)) {
      setCurrentViewId(indexView.id);
      return;
    }

    if (isDefined(viewIdQueryParam)) {
      setCurrentViewId(viewIdQueryParam);
    }
  }, [
    currentViewId,
    getFiltersFromQueryParams,
    setCurrentViewId,
    viewIdQueryParam,
    viewsOnCurrentObject,
  ]);

  return <></>;
};
