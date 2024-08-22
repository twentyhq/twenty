import { useLastVisitedObjectMetadataItem } from '@/navigation/hooks/useLastVisitedObjectMetadataItem';
import { useLastVisitedView } from '@/navigation/hooks/useLastVisitedView';
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
    getLastVisitedViewIdFromPluralName,
    setLastVisitedViewForObjectNamePlural,
  } = useLastVisitedView();
  const {
    lastVisitedObjectMetadataItemId,
    setLastVisitedObjectMetadataItemForPluralName,
  } = useLastVisitedObjectMetadataItem();

  const lastVisitedViewId =
    getLastVisitedViewIdFromPluralName(objectNamePlural);
  const isLastVisitedObjectMetadataItemNotEqual = !isDeeplyEqual(
    objectMetadataItemId?.id,
    lastVisitedObjectMetadataItemId,
  );

  useEffect(() => {
    const indexView = viewsOnCurrentObject.find((view) => view.key === 'INDEX');

    if (isUndefined(viewIdQueryParam) && isDefined(lastVisitedViewId)) {
      if (isLastVisitedObjectMetadataItemNotEqual) {
        setLastVisitedObjectMetadataItemForPluralName(objectNamePlural);
        setLastVisitedViewForObjectNamePlural({
          objectNamePlural,
          viewId: lastVisitedViewId,
        });
      }
      setCurrentViewId(lastVisitedViewId);
      return;
    }

    if (isDefined(viewIdQueryParam)) {
      if (isLastVisitedObjectMetadataItemNotEqual) {
        setLastVisitedObjectMetadataItemForPluralName(objectNamePlural);
      }
      if (!isDeeplyEqual(viewIdQueryParam, lastVisitedViewId)) {
        setLastVisitedViewForObjectNamePlural({
          objectNamePlural,
          viewId: viewIdQueryParam,
        });
      }
      setCurrentViewId(viewIdQueryParam);
      return;
    }

    if (isDefined(indexView)) {
      if (isLastVisitedObjectMetadataItemNotEqual) {
        setLastVisitedObjectMetadataItemForPluralName(objectNamePlural);
      }
      if (!isDeeplyEqual(indexView.id, lastVisitedViewId)) {
        setLastVisitedViewForObjectNamePlural({
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
    isLastVisitedObjectMetadataItemNotEqual,
    lastVisitedViewId,
    objectMetadataItemId?.id,
    objectNamePlural,
    setCurrentViewId,
    setLastVisitedObjectMetadataItemForPluralName,
    setLastVisitedViewForObjectNamePlural,
    viewIdQueryParam,
    viewsOnCurrentObject,
  ]);

  return <></>;
};
