import { contextStoreCurrentObjectMetadataIdComponentState } from '@/context-store/states/contextStoreCurrentObjectMetadataIdComponentState';
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
  const setContextStoreCurrentObjectMetadataId = useSetRecoilComponentStateV2(
    contextStoreCurrentObjectMetadataIdComponentState,
  );

  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular: objectNameSingular,
  });

  useEffect(() => {
    setContextStoreCurrentObjectMetadataId(objectMetadataItem?.id);

    return () => {
      setContextStoreCurrentObjectMetadataId(null);
    };
  }, [recordId, setContextStoreCurrentObjectMetadataId, objectMetadataItem.id]);

  return null;
};
