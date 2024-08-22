import { useLastVisitedPageOrView } from '@/navigation/hooks/useLastVisitedPageOrView';
import { useFilteredObjectMetadataItems } from '@/object-metadata/hooks/useFilteredObjectMetadataItems';
import { useViewFromQueryParams } from '@/views/hooks/internal/useViewFromQueryParams';
import { useViewStates } from '@/views/hooks/internal/useViewStates';
import { useGetCurrentView } from '@/views/hooks/useGetCurrentView';
import { isUndefined } from '@sniptt/guards';
import { useEffect } from 'react';
import { useRecoilState } from 'recoil';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';
import { isDefined } from '~/utils/isDefined';

export const QueryParamsViewIdEffect = () => {
  const { getFiltersFromQueryParams, viewIdQueryParam } =
    useViewFromQueryParams();
  const { currentViewIdState, componentId } = useViewStates();

  const [currentViewId, setCurrentViewId] = useRecoilState(currentViewIdState);
  const { viewsOnCurrentObject } = useGetCurrentView();
  const { findObjectMetadataItemByNamePlural } =
    useFilteredObjectMetadataItems();
  const objectMetadataItemId = findObjectMetadataItemByNamePlural(componentId);
  const {
    getLastVisitedViewId,
    setLastVisitedObjectOrView,
    lastVisitedObjectMetadataItemId,
  } = useLastVisitedPageOrView();
  const lastVisitedViewId = getLastVisitedViewId(componentId);
  const isLastVisitedObjectMetadataItemNotEqual = !isDeeplyEqual(
    objectMetadataItemId?.id,
    lastVisitedObjectMetadataItemId,
  );
  useEffect(() => {
    const indexView = viewsOnCurrentObject.find((view) => view.key === 'INDEX');

    if (isUndefined(viewIdQueryParam) && isDefined(lastVisitedViewId)) {
      if (
        !isDeeplyEqual(lastVisitedViewId, getLastVisitedViewId(componentId)) ||
        isLastVisitedObjectMetadataItemNotEqual
      ) {
        setLastVisitedObjectOrView({
          componentId,
          viewId: lastVisitedViewId,
        });
      }
      setCurrentViewId(lastVisitedViewId);
      return;
    }

    if (isDefined(viewIdQueryParam)) {
      if (
        !isDeeplyEqual(viewIdQueryParam, getLastVisitedViewId(componentId)) ||
        isLastVisitedObjectMetadataItemNotEqual
      ) {
        setLastVisitedObjectOrView({
          componentId,
          viewId: viewIdQueryParam,
        });
      }

      setCurrentViewId(viewIdQueryParam);
      return;
    }

    if (isDefined(indexView)) {
      if (
        !isDeeplyEqual(indexView.id, getLastVisitedViewId(componentId)) ||
        isLastVisitedObjectMetadataItemNotEqual
      ) {
        setLastVisitedObjectOrView({
          componentId,
          viewId: indexView.id,
        });
      }
      setCurrentViewId(indexView.id);
      return;
    }
  }, [
    componentId,
    currentViewId,
    getFiltersFromQueryParams,
    getLastVisitedViewId,
    isLastVisitedObjectMetadataItemNotEqual,
    lastVisitedViewId,
    objectMetadataItemId?.id,
    setCurrentViewId,
    setLastVisitedObjectOrView,
    viewIdQueryParam,
    viewsOnCurrentObject,
  ]);

  return <></>;
};
