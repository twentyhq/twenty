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
  const { currentViewIdState, componentId: objectNamePlural } = useViewStates();

  const [currentViewId, setCurrentViewId] = useRecoilState(currentViewIdState);
  const { viewsOnCurrentObject } = useGetCurrentView();
  const { findObjectMetadataItemByNamePlural } =
    useFilteredObjectMetadataItems();
  const objectMetadataItemId =
    findObjectMetadataItemByNamePlural(objectNamePlural);
  const {
    getLastVisitedViewId,
    setLastVisitedObjectOrView,
    lastVisitedObjectMetadataItemId,
  } = useLastVisitedPageOrView();
  const lastVisitedViewId = getLastVisitedViewId(objectNamePlural);
  const isLastVisitedObjectMetadataItemNotEqual = !isDeeplyEqual(
    objectMetadataItemId?.id,
    lastVisitedObjectMetadataItemId,
  );
  useEffect(() => {
    const indexView = viewsOnCurrentObject.find((view) => view.key === 'INDEX');

    if (isUndefined(viewIdQueryParam) && isDefined(lastVisitedViewId)) {
      if (isLastVisitedObjectMetadataItemNotEqual) {
        setLastVisitedObjectOrView({
          objectNamePlural,
          viewId: lastVisitedViewId,
        });
      }
      setCurrentViewId(lastVisitedViewId);
      return;
    }

    if (isDefined(viewIdQueryParam)) {
      if (
        !isDeeplyEqual(viewIdQueryParam, lastVisitedViewId) ||
        isLastVisitedObjectMetadataItemNotEqual
      ) {
        setLastVisitedObjectOrView({
          objectNamePlural,
          viewId: viewIdQueryParam,
        });
      }

      setCurrentViewId(viewIdQueryParam);
      return;
    }

    if (isDefined(indexView)) {
      if (
        !isDeeplyEqual(indexView.id, lastVisitedViewId) ||
        isLastVisitedObjectMetadataItemNotEqual
      ) {
        setLastVisitedObjectOrView({
          objectNamePlural,
          viewId: indexView.id,
        });
      }
      setCurrentViewId(indexView.id);
      return;
    }
  }, [
    currentViewId,
    getFiltersFromQueryParams,
    getLastVisitedViewId,
    isLastVisitedObjectMetadataItemNotEqual,
    lastVisitedViewId,
    objectMetadataItemId?.id,
    objectNamePlural,
    setCurrentViewId,
    setLastVisitedObjectOrView,
    viewIdQueryParam,
    viewsOnCurrentObject,
  ]);

  return <></>;
};
