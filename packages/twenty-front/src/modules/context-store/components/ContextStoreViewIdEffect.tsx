import { contextStoreCurrentViewIdComponentState } from '@/context-store/states/contextStoreCurrentViewIdComponentState';
import { useLastVisitedObjectMetadataItem } from '@/navigation/hooks/useLastVisitedObjectMetadataItem';
import { useLastVisitedView } from '@/navigation/hooks/useLastVisitedView';
import { useFilteredObjectMetadataItems } from '@/object-metadata/hooks/useFilteredObjectMetadataItems';
import { usePrefetchedData } from '@/prefetch/hooks/usePrefetchedData';
import { PrefetchKey } from '@/prefetch/types/PrefetchKey';
import { useRecoilComponentStateV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentStateV2';
import { useViewFromQueryParams } from '@/views/hooks/internal/useViewFromQueryParams';
import { View } from '@/views/types/View';
import { isUndefined } from '@sniptt/guards';
import { useEffect } from 'react';
import { isDefined } from 'twenty-shared';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';

export const ContextStoreViewIdEffect = ({
  objectNamePlural,
}: {
  objectNamePlural: string;
}) => {
  const { viewIdQueryParam } = useViewFromQueryParams();

  const { records: views } = usePrefetchedData<View>(PrefetchKey.AllViews);

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
  const [contextStoreCurrentViewId, setContextStoreCurrentViewId] =
    useRecoilComponentStateV2(
      contextStoreCurrentViewIdComponentState,
      objectNamePlural,
    );

  const viewsOnCurrentObject = views.filter(
    (view) => view.objectMetadataId === objectMetadataItemId?.id,
  );
  const indexView = viewsOnCurrentObject.find((view) => view.key === 'INDEX');

  useEffect(() => {
    if (isUndefined(viewIdQueryParam) && isDefined(lastVisitedViewId)) {
      if (isLastVisitedObjectMetadataItemDifferent) {
        setLastVisitedObjectMetadataItem(objectNamePlural);
        setLastVisitedView({
          objectNamePlural,
          viewId: lastVisitedViewId,
        });
      }
      if (contextStoreCurrentViewId !== lastVisitedViewId) {
        setContextStoreCurrentViewId(lastVisitedViewId);
      }
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
      if (contextStoreCurrentViewId !== viewIdQueryParam) {
        setContextStoreCurrentViewId(viewIdQueryParam);
      }
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
      if (contextStoreCurrentViewId !== indexView.id) {
        setContextStoreCurrentViewId(indexView.id);
      }
      return;
    }

    return () => {
      setContextStoreCurrentViewId(null);
    };
  }, [
    contextStoreCurrentViewId,
    indexView,
    isLastVisitedObjectMetadataItemDifferent,
    lastVisitedViewId,
    objectNamePlural,
    setContextStoreCurrentViewId,
    setLastVisitedObjectMetadataItem,
    setLastVisitedView,
    viewIdQueryParam,
    views,
  ]);

  return <></>;
};
