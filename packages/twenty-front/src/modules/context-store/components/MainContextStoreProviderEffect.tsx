import { contextStoreCurrentObjectMetadataIdComponentState } from '@/context-store/states/contextStoreCurrentObjectMetadataIdComponentState';
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
    contextStoreCurrentObjectMetadataId,
    setContextStoreCurrentObjectMetadataId,
  ] = useRecoilComponentStateV2(
    contextStoreCurrentObjectMetadataIdComponentState,
    mainContextStoreComponentInstanceId,
  );

  useEffect(() => {
    if (contextStoreCurrentObjectMetadataId !== objectMetadataItem.id) {
      setContextStoreCurrentObjectMetadataId(objectMetadataItem.id);
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
    contextStoreCurrentObjectMetadataId,
    contextStoreCurrentViewId,
    mainContextStoreComponentInstanceId,
    mainContextStoreComponentInstanceIdToSet,
    objectMetadataItem,
    objectMetadataItem.namePlural,
    setContextStoreCurrentObjectMetadataId,
    setContextStoreCurrentViewId,
    setLastVisitedObjectMetadataId,
    setLastVisitedViewForObjectMetadataNamePlural,
    setMainContextStoreComponentInstanceId,
    viewId,
  ]);

  return null;
};
