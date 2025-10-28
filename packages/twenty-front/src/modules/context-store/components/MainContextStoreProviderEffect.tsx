import { MAIN_CONTEXT_STORE_INSTANCE_ID } from '@/context-store/constants/MainContextStoreInstanceId';
import { contextStoreCurrentObjectMetadataItemIdComponentState } from '@/context-store/states/contextStoreCurrentObjectMetadataItemIdComponentState';
import { contextStoreCurrentViewIdComponentState } from '@/context-store/states/contextStoreCurrentViewIdComponentState';
import { contextStoreCurrentViewTypeComponentState } from '@/context-store/states/contextStoreCurrentViewTypeComponentState';
import { getViewType } from '@/context-store/utils/getViewType';
import { useSetLastVisitedObjectMetadataId } from '@/navigation/hooks/useSetLastVisitedObjectMetadataId';
import { useSetLastVisitedViewForObjectMetadataNamePlural } from '@/navigation/hooks/useSetLastVisitedViewForObjectMetadataNamePlural';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { useRecoilComponentState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentState';
import { coreViewFromViewIdFamilySelector } from '@/views/states/selectors/coreViewFromViewIdFamilySelector';
import { useEffect } from 'react';
import { useRecoilValue } from 'recoil';

type MainContextStoreProviderEffectProps = {
  viewId?: string;
  objectMetadataItem?: ObjectMetadataItem;
  isRecordIndexPage: boolean;
  isRecordShowPage: boolean;
  isSettingsPage: boolean;
};

export const MainContextStoreProviderEffect = ({
  viewId,
  objectMetadataItem,
  isRecordIndexPage,
  isRecordShowPage,
  isSettingsPage,
}: MainContextStoreProviderEffectProps) => {
  const { setLastVisitedViewForObjectMetadataNamePlural } =
    useSetLastVisitedViewForObjectMetadataNamePlural();

  const { setLastVisitedObjectMetadataId } =
    useSetLastVisitedObjectMetadataId();

  const [contextStoreCurrentViewId, setContextStoreCurrentViewId] =
    useRecoilComponentState(
      contextStoreCurrentViewIdComponentState,
      MAIN_CONTEXT_STORE_INSTANCE_ID,
    );

  const [contextStoreCurrentViewType, setContextStoreCurrentViewType] =
    useRecoilComponentState(
      contextStoreCurrentViewTypeComponentState,
      MAIN_CONTEXT_STORE_INSTANCE_ID,
    );

  const [
    contextStoreCurrentObjectMetadataItemId,
    setContextStoreCurrentObjectMetadataItemId,
  ] = useRecoilComponentState(
    contextStoreCurrentObjectMetadataItemIdComponentState,
    MAIN_CONTEXT_STORE_INSTANCE_ID,
  );

  const view = useRecoilValue(
    coreViewFromViewIdFamilySelector({
      viewId: viewId ?? '',
    }),
  );

  useEffect(() => {
    if (contextStoreCurrentObjectMetadataItemId !== objectMetadataItem?.id) {
      setContextStoreCurrentObjectMetadataItemId(objectMetadataItem?.id);
    }

    if (!objectMetadataItem) {
      return;
    }

    setLastVisitedViewForObjectMetadataNamePlural({
      objectNamePlural: objectMetadataItem.namePlural,
      viewId: viewId ?? '',
    });

    setLastVisitedObjectMetadataId({
      objectMetadataItemId: objectMetadataItem.id,
    });
  }, [
    contextStoreCurrentObjectMetadataItemId,
    objectMetadataItem,
    setContextStoreCurrentObjectMetadataItemId,
    setLastVisitedObjectMetadataId,
    setLastVisitedViewForObjectMetadataNamePlural,
    viewId,
  ]);

  useEffect(() => {
    if (isSettingsPage) {
      setContextStoreCurrentViewId(undefined);
      return;
    }

    if (contextStoreCurrentViewId !== viewId) {
      setContextStoreCurrentViewId(viewId);
    }
  }, [
    contextStoreCurrentViewId,
    isSettingsPage,
    setContextStoreCurrentViewId,
    viewId,
  ]);

  useEffect(() => {
    const viewType = getViewType({
      isSettingsPage,
      isRecordShowPage,
      isRecordIndexPage,
      view,
    });

    if (contextStoreCurrentViewType !== viewType) {
      setContextStoreCurrentViewType(viewType);
    }
  }, [
    contextStoreCurrentViewType,
    setContextStoreCurrentViewType,
    view,
    isSettingsPage,
    isRecordShowPage,
    isRecordIndexPage,
  ]);

  return null;
};
