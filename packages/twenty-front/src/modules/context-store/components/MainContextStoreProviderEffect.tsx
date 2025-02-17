import { contextStoreCurrentObjectMetadataItemComponentState } from '@/context-store/states/contextStoreCurrentObjectMetadataItemComponentState';
import { contextStoreCurrentViewIdComponentState } from '@/context-store/states/contextStoreCurrentViewIdComponentState';
import { mainContextStoreComponentInstanceIdState } from '@/context-store/states/mainContextStoreComponentInstanceId';
import { useSetLastVisitedObjectMetadataId } from '@/navigation/hooks/useSetLastVisitedObjectMetadataId';
import { useSetLastVisitedViewForObjectMetadataNamePlural } from '@/navigation/hooks/useSetLastVisitedViewForObjectMetadataNamePlural';
import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { useRecoilComponentStateV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentStateV2';
import { useEffect } from 'react';
import { useRecoilState } from 'recoil';

export const MainContextStoreProviderEffect = ({
  mainContextStoreComponentInstanceIdToSet,
  viewId,
  objectMetadataItem,
}: {
  mainContextStoreComponentInstanceIdToSet: string;
  viewId: string;
  objectMetadataItem: ObjectMetadataItem;
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

  const [
    contextStoreCurrentObjectMetadataItem,
    setContextStoreCurrentObjectMetadataItem,
  ] = useRecoilComponentStateV2(
    contextStoreCurrentObjectMetadataItemComponentState,
    mainContextStoreComponentInstanceId,
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
      viewId: viewId,
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

  return null;
};
