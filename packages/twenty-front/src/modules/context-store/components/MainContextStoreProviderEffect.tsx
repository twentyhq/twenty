import { MAIN_CONTEXT_STORE_INSTANCE_ID } from '@/context-store/constants/MainContextStoreInstanceId';
import { contextStoreCurrentObjectMetadataItemIdComponentState } from '@/context-store/states/contextStoreCurrentObjectMetadataItemIdComponentState';
import { contextStoreCurrentViewIdComponentState } from '@/context-store/states/contextStoreCurrentViewIdComponentState';
import { contextStoreCurrentViewTypeComponentState } from '@/context-store/states/contextStoreCurrentViewTypeComponentState';
import { ContextStoreViewType } from '@/context-store/types/ContextStoreViewType';
import { useSetLastVisitedObjectMetadataId } from '@/navigation/hooks/useSetLastVisitedObjectMetadataId';
import { useSetLastVisitedViewForObjectMetadataNamePlural } from '@/navigation/hooks/useSetLastVisitedViewForObjectMetadataNamePlural';
import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { prefetchViewFromViewIdFamilySelector } from '@/prefetch/states/selector/prefetchViewFromViewIdFamilySelector';
import { useRecoilComponentStateV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentStateV2';
import { ViewType } from '@/views/types/ViewType';
import { useEffect } from 'react';
import { useRecoilValue } from 'recoil';

export const MainContextStoreProviderEffect = ({
  viewId,
  objectMetadataItem,
  pageName,
}: {
  viewId?: string;
  objectMetadataItem: ObjectMetadataItem;
  pageName: string;
}) => {
  const { setLastVisitedViewForObjectMetadataNamePlural } =
    useSetLastVisitedViewForObjectMetadataNamePlural();

  const { setLastVisitedObjectMetadataId } =
    useSetLastVisitedObjectMetadataId();

  const [contextStoreCurrentViewId, setContextStoreCurrentViewId] =
    useRecoilComponentStateV2(
      contextStoreCurrentViewIdComponentState,
      MAIN_CONTEXT_STORE_INSTANCE_ID,
    );

  const [contextStoreCurrentViewType, setContextStoreCurrentViewType] =
    useRecoilComponentStateV2(
      contextStoreCurrentViewTypeComponentState,
      MAIN_CONTEXT_STORE_INSTANCE_ID,
    );

  const [
    contextStoreCurrentObjectMetadataItemId,
    setContextStoreCurrentObjectMetadataItemId,
  ] = useRecoilComponentStateV2(
    contextStoreCurrentObjectMetadataItemIdComponentState,
    MAIN_CONTEXT_STORE_INSTANCE_ID,
  );

  const view = useRecoilValue(
    prefetchViewFromViewIdFamilySelector({
      viewId: viewId ?? '',
    }),
  );

  useEffect(() => {
    if (contextStoreCurrentObjectMetadataItemId !== objectMetadataItem.id) {
      setContextStoreCurrentObjectMetadataItemId(objectMetadataItem.id);
    }

    setLastVisitedViewForObjectMetadataNamePlural({
      objectNamePlural: objectMetadataItem.namePlural,
      viewId: viewId ?? '',
    });

    setLastVisitedObjectMetadataId({
      objectMetadataItemId: objectMetadataItem.id,
    });

    if (contextStoreCurrentViewId !== viewId) {
      setContextStoreCurrentViewId(viewId);
    }
  }, [
    contextStoreCurrentObjectMetadataItemId,
    contextStoreCurrentViewId,
    objectMetadataItem,
    objectMetadataItem.namePlural,
    setContextStoreCurrentObjectMetadataItemId,
    setContextStoreCurrentViewId,
    setLastVisitedObjectMetadataId,
    setLastVisitedViewForObjectMetadataNamePlural,
    viewId,
  ]);

  useEffect(() => {
    const viewType =
      pageName === 'record-show'
        ? ContextStoreViewType.ShowPage
        : view && view.type === ViewType.Kanban
          ? ContextStoreViewType.Kanban
          : ContextStoreViewType.Table;

    if (contextStoreCurrentViewType !== viewType) {
      setContextStoreCurrentViewType(viewType);
    }
  }, [
    contextStoreCurrentViewType,
    pageName,
    setContextStoreCurrentViewType,
    view,
  ]);

  return null;
};
