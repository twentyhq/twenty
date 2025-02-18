import { contextStoreCurrentObjectMetadataItemComponentState } from '@/context-store/states/contextStoreCurrentObjectMetadataItemComponentState';
import { contextStoreCurrentViewIdComponentState } from '@/context-store/states/contextStoreCurrentViewIdComponentState';
import { contextStoreCurrentViewTypeComponentState } from '@/context-store/states/contextStoreCurrentViewTypeComponentState';
import { mainContextStoreComponentInstanceIdState } from '@/context-store/states/mainContextStoreComponentInstanceId';
import { ContextStoreViewType } from '@/context-store/types/ContextStoreViewType';
import { useSetLastVisitedObjectMetadataId } from '@/navigation/hooks/useSetLastVisitedObjectMetadataId';
import { useSetLastVisitedViewForObjectMetadataNamePlural } from '@/navigation/hooks/useSetLastVisitedViewForObjectMetadataNamePlural';
import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { prefetchViewFromViewIdFamilySelector } from '@/prefetch/states/selector/prefetchViewFromViewIdFamilySelector';
import { useRecoilComponentStateV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentStateV2';
import { ViewType } from '@/views/types/ViewType';
import { useEffect } from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';

export const MainContextStoreProviderEffect = ({
  mainContextStoreComponentInstanceIdToSet,
  viewId,
  objectMetadataItem,
  pageName,
}: {
  mainContextStoreComponentInstanceIdToSet: string;
  viewId?: string;
  objectMetadataItem: ObjectMetadataItem;
  pageName: string;
}) => {
  const [
    mainContextStoreComponentInstanceId,
    setMainContextStoreComponentInstanceId,
  ] = useRecoilState(mainContextStoreComponentInstanceIdState);

  const { setLastVisitedViewForObjectMetadataNamePlural } =
    useSetLastVisitedViewForObjectMetadataNamePlural();

  const { setLastVisitedObjectMetadataId } =
    useSetLastVisitedObjectMetadataId();

  const [contextStoreCurrentViewId, setContextStoreCurrentViewId] =
    useRecoilComponentStateV2(
      contextStoreCurrentViewIdComponentState,
      mainContextStoreComponentInstanceId,
    );

  const [contextStoreCurrentViewType, setContextStoreCurrentViewType] =
    useRecoilComponentStateV2(
      contextStoreCurrentViewTypeComponentState,
      mainContextStoreComponentInstanceId,
    );

  const [
    contextStoreCurrentObjectMetadataItem,
    setContextStoreCurrentObjectMetadataItem,
  ] = useRecoilComponentStateV2(
    contextStoreCurrentObjectMetadataItemComponentState,
    mainContextStoreComponentInstanceId,
  );

  const view = useRecoilValue(
    prefetchViewFromViewIdFamilySelector({
      viewId: viewId ?? '',
    }),
  );

  useEffect(() => {
    if (contextStoreCurrentObjectMetadataItem?.id !== objectMetadataItem.id) {
      setContextStoreCurrentObjectMetadataItem(objectMetadataItem);
    }

    if (
      mainContextStoreComponentInstanceIdToSet !==
      mainContextStoreComponentInstanceId
    ) {
      setMainContextStoreComponentInstanceId(
        mainContextStoreComponentInstanceIdToSet,
      );
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
    contextStoreCurrentObjectMetadataItem,
    contextStoreCurrentViewId,
    mainContextStoreComponentInstanceId,
    mainContextStoreComponentInstanceIdToSet,
    objectMetadataItem,
    objectMetadataItem.namePlural,
    setContextStoreCurrentObjectMetadataItem,
    setContextStoreCurrentViewId,
    setLastVisitedObjectMetadataId,
    setLastVisitedViewForObjectMetadataNamePlural,
    setMainContextStoreComponentInstanceId,
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
