import { contextStoreCurrentObjectMetadataItemComponentState } from '@/context-store/states/contextStoreCurrentObjectMetadataItemComponentState';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useSetRecoilComponentStateV2 } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentStateV2';
import { useEffect } from 'react';

export const RecordShowContainerContextStoreObjectMetadataIdEffect = ({
  recordId,
  objectNameSingular,
}: {
  recordId: string;
  objectNameSingular: string;
}) => {
  const setContextStoreCurrentObjectMetadataItem = useSetRecoilComponentStateV2(
    contextStoreCurrentObjectMetadataItemComponentState,
  );

  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular: objectNameSingular,
  });

  useEffect(() => {
    setContextStoreCurrentObjectMetadataItem(objectMetadataItem);

    return () => {
      setContextStoreCurrentObjectMetadataItem(undefined);
    };
  }, [
    recordId,
    objectMetadataItem.id,
    setContextStoreCurrentObjectMetadataItem,
    objectMetadataItem,
  ]);

  return null;
};
