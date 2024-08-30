import { useLastVisitedObjectMetadataItem } from '@/navigation/hooks/useLastVisitedObjectMetadataItem';
import { useLastVisitedView } from '@/navigation/hooks/useLastVisitedView';
import { useFilteredObjectMetadataItems } from '@/object-metadata/hooks/useFilteredObjectMetadataItems';
import { useRecoilComponentState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentState';
import { useViewFromQueryParams } from '@/views/hooks/internal/useViewFromQueryParams';
import { useViewStates } from '@/views/hooks/internal/useViewStates';
import { useGetCurrentView } from '@/views/hooks/useGetCurrentView';
import { currentViewIdComponentState } from '@/views/states/currentViewIdComponentState';
import { isUndefined } from '@sniptt/guards';
import { useEffect } from 'react';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';
import { isDefined } from '~/utils/isDefined';

export const QueryParamsViewIdEffect = () => {
  const { getFiltersFromQueryParams, viewIdQueryParam } =
    useViewFromQueryParams();
  const { componentId: objectNamePlural } = useViewStates();

  const [currentViewId, setCurrentViewId] = useRecoilComponentState(
    currentViewIdComponentState,
  );
  const { viewsOnCurrentObject } = useGetCurrentView();
  const { findObjectMetadataItemByNamePlural } =
    useFilteredObjectMetadataItems();
  const objectMetadataItemId =
    findObjectMetadataItemByNamePlural(objectNamePlural);
  const { getLastVisitedViewIdFromObjectNamePlural, setLastVisitedView } =
    useLastVisitedView();
  const { lastVisitedObjectMetadataItemId, setLastVisitedObjectMetadataItem } =
    useLastVisitedObjectMetadataItem();

  const lastVisitedViewId =
    getLastVisitedViewIdFromObjectNamePlural(objectNamePlural);
  const isLastVisitedObjectMetadataItemDifferent = !isDeeplyEqual(
    objectMetadataItemId?.id,
    lastVisitedObjectMetadataItemId,
  );

  useEffect(() => {
    const indexView = viewsOnCurrentObject.find((view) => view.key === 'INDEX');

    if (isUndefined(viewIdQueryParam) && isDefined(lastVisitedViewId)) {
      if (isLastVisitedObjectMetadataItemDifferent) {
        setLastVisitedObjectMetadataItem(objectNamePlural);
        setLastVisitedView({
          objectNamePlural,
          viewId: lastVisitedViewId,
        });
      }
      setCurrentViewId(lastVisitedViewId);
      return;
    }

    if (isDefined(viewIdQueryParam)) {
      if (isLastVisitedObjectMetadataItemDifferent) {
        setLastVisitedObjectMetadataItem(objectNamePlural);
      }
      if (!isDeeplyEqual(viewIdQueryParam, lastVisitedViewId)) {
        setLastVisitedView({
          objectNamePlural,
          viewId: viewIdQueryParam,
        });
      }
      setCurrentViewId(viewIdQueryParam);
      return;
    }

    if (isDefined(indexView)) {
      if (isLastVisitedObjectMetadataItemDifferent) {
        setLastVisitedObjectMetadataItem(objectNamePlural);
      }
      if (!isDeeplyEqual(indexView.id, lastVisitedViewId)) {
        setLastVisitedView({
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
    isLastVisitedObjectMetadataItemDifferent,
    lastVisitedViewId,
    objectMetadataItemId?.id,
    objectNamePlural,
    setCurrentViewId,
    setLastVisitedObjectMetadataItem,
    setLastVisitedView,
    viewIdQueryParam,
    viewsOnCurrentObject,
  ]);

  return <></>;
};
