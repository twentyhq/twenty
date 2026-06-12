import { contextStoreCurrentObjectMetadataItemIdComponentState } from '@/context-store/states/contextStoreCurrentObjectMetadataItemIdComponentState';
import { contextStoreCurrentViewIdComponentState } from '@/context-store/states/contextStoreCurrentViewIdComponentState';
import { contextStoreCurrentViewTypeComponentState } from '@/context-store/states/contextStoreCurrentViewTypeComponentState';
import { ContextStoreViewType } from '@/context-store/types/ContextStoreViewType';
import { useSetAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useSetAtomComponentState';
import { useEffect } from 'react';

type RecordTableWidgetContextStoreInitEffectProps = {
  objectMetadataItemId: string;
  viewId: string;
};

export const RecordTableWidgetContextStoreInitEffect = ({
  objectMetadataItemId,
  viewId,
}: RecordTableWidgetContextStoreInitEffectProps) => {
  const setContextStoreCurrentObjectMetadataItemId = useSetAtomComponentState(
    contextStoreCurrentObjectMetadataItemIdComponentState,
  );

  const setContextStoreCurrentViewId = useSetAtomComponentState(
    contextStoreCurrentViewIdComponentState,
  );

  const setContextStoreCurrentViewType = useSetAtomComponentState(
    contextStoreCurrentViewTypeComponentState,
  );

  useEffect(() => {
    setContextStoreCurrentObjectMetadataItemId(objectMetadataItemId);
    setContextStoreCurrentViewId(viewId);
    setContextStoreCurrentViewType(ContextStoreViewType.Table);
  }, [
    objectMetadataItemId,
    viewId,
    setContextStoreCurrentObjectMetadataItemId,
    setContextStoreCurrentViewId,
    setContextStoreCurrentViewType,
  ]);

  return null;
};
