import { contextStoreCurrentObjectMetadataItemComponentState } from '@/context-store/states/contextStoreCurrentObjectMetadataItemComponentState';
import { contextStoreCurrentViewIdComponentState } from '@/context-store/states/contextStoreCurrentViewIdComponentState';
import { mainContextStoreComponentInstanceIdState } from '@/context-store/states/mainContextStoreComponentInstanceId';
import { useSetLastVisitedObjectMetadataId } from '@/navigation/hooks/useSetLastVisitedObjectMetadataId';
import { useSetLastVisitedViewForObjectMetadataNamePlural } from '@/navigation/hooks/useSetLastVisitedViewForObjectMetadataNamePlural';
import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { useRecoilComponentStateV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentStateV2';
import { View } from '@/views/types/View';
import { useEffect } from 'react';
import { useRecoilState } from 'recoil';

export const MainContextStoreProviderEffect = ({
  mainContextStoreComponentInstanceIdToSet,
  view,
  objectMetadataItem,
}: {
  mainContextStoreComponentInstanceIdToSet: string;
  view: View;
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
  console.log('Provider effect');

  useEffect(() => {
    if (contextStoreCurrentObjectMetadataItem?.id !== objectMetadataItem.id) {
      console.log('Setting object metadata item');
      console.log('objectMetadataItem', objectMetadataItem);
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
      viewId: view.id,
    });

    setLastVisitedObjectMetadataId({
      objectMetadataItemId: objectMetadataItem.id,
    });

    if (contextStoreCurrentViewId !== view.id) {
      setContextStoreCurrentViewId(view.id);
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
    view,
  ]);

  return null;
};
