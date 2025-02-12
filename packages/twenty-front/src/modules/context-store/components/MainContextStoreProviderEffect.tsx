import { contextStoreCurrentViewIdComponentState } from '@/context-store/states/contextStoreCurrentViewIdComponentState';
import { mainContextStoreComponentInstanceIdState } from '@/context-store/states/mainContextStoreComponentInstanceId';
import { useLastVisitedObjectMetadataItem } from '@/navigation/hooks/useLastVisitedObjectMetadataItem';
import { useLastVisitedView } from '@/navigation/hooks/useLastVisitedView';
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

  const { getLastVisitedViewIdFromObjectNamePlural, setLastVisitedView } =
    useLastVisitedView();

  const { lastVisitedObjectMetadataItemId, setLastVisitedObjectMetadataItem } =
    useLastVisitedObjectMetadataItem();

  const lastVisitedViewId = getLastVisitedViewIdFromObjectNamePlural(
    objectMetadataItem.namePlural,
  );

  const [contextStoreCurrentViewId, setContextStoreCurrentViewId] =
    useRecoilComponentStateV2(
      contextStoreCurrentViewIdComponentState,
      mainContextStoreComponentInstanceId,
    );

  useEffect(() => {
    if (
      mainContextStoreComponentInstanceIdToSet !==
      mainContextStoreComponentInstanceId
    ) {
      setMainContextStoreComponentInstanceId(
        mainContextStoreComponentInstanceIdToSet,
      );
    }

    if (viewId !== lastVisitedViewId) {
      setLastVisitedView({
        objectNamePlural: objectMetadataItem.namePlural,
        viewId: viewId,
      });
    }

    if (objectMetadataItem.id !== lastVisitedObjectMetadataItemId) {
      setLastVisitedObjectMetadataItem(objectMetadataItem.namePlural);
    }

    if (contextStoreCurrentViewId !== viewId) {
      console.log('contextStoreCurrentViewId', contextStoreCurrentViewId);
      setContextStoreCurrentViewId(viewId);
    }
  }, [
    contextStoreCurrentViewId,
    lastVisitedObjectMetadataItemId,
    lastVisitedViewId,
    mainContextStoreComponentInstanceId,
    mainContextStoreComponentInstanceIdToSet,
    objectMetadataItem,
    objectMetadataItem.namePlural,
    setContextStoreCurrentViewId,
    setLastVisitedObjectMetadataItem,
    setLastVisitedView,
    setMainContextStoreComponentInstanceId,
    viewId,
  ]);

  return null;
};
