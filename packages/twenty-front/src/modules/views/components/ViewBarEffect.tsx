import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';

import { usePrefetchedData } from '@/prefetch/hooks/usePrefetchedData';
import { PrefetchKey } from '@/prefetch/types/PrefetchKey';
import { useViewBar } from '@/views/hooks/useViewBar';
import { GraphQLView } from '@/views/types/GraphQLView';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';
import { isDefined } from '~/utils/isDefined';
import { isUndefinedOrNull } from '~/utils/isUndefinedOrNull';

import { useViewScopedStates } from '../hooks/internal/useViewScopedStates';

export const ViewBarEffect = () => {
  const {
    loadView,
    changeViewInUrl,
    loadViewFields,
    loadViewFilters,
    loadViewSorts,
  } = useViewBar();

  const [searchParams] = useSearchParams();
  const currentViewIdFromUrl = searchParams.get('view');

  const { viewObjectMetadataIdState, viewsState, currentViewIdState } =
    useViewScopedStates();

  const [views, setViews] = useRecoilState(viewsState);
  const viewObjectMetadataId = useRecoilValue(viewObjectMetadataIdState);
  const setCurrentViewId = useSetRecoilState(currentViewIdState);

  const { records: newViews } = usePrefetchedData<GraphQLView>(
    PrefetchKey.AllViews,
  );

  const newViewsOnCurrentObject = newViews.filter(
    (view) => view.objectMetadataId === viewObjectMetadataId,
  );

  useEffect(() => {
    if (!newViewsOnCurrentObject.length) return;

    if (!isDeeplyEqual(views, newViewsOnCurrentObject)) {
      setViews(newViewsOnCurrentObject);
    }

    const currentView =
      newViewsOnCurrentObject.find(
        (view) => view.id === currentViewIdFromUrl,
      ) ??
      newViewsOnCurrentObject[0] ??
      null;

    if (isUndefinedOrNull(currentView)) return;

    setCurrentViewId(currentView.id);

    if (isDefined(currentView?.viewFields)) {
      loadViewFields(currentView.viewFields, currentView.id);
      loadViewFilters(currentView.viewFilters, currentView.id);
      loadViewSorts(currentView.viewSorts, currentView.id);
    }

    if (!currentViewIdFromUrl) return changeViewInUrl(currentView.id);
  }, [
    changeViewInUrl,
    currentViewIdFromUrl,
    loadViewFields,
    loadViewFilters,
    loadViewSorts,
    newViewsOnCurrentObject,
    setCurrentViewId,
    setViews,
    views,
  ]);

  useEffect(() => {
    if (!currentViewIdFromUrl || !newViewsOnCurrentObject.length) return;

    loadView(currentViewIdFromUrl);
  }, [currentViewIdFromUrl, loadView, newViewsOnCurrentObject]);

  return <></>;
};
