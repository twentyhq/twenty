import { contextStoreCurrentObjectMetadataIdComponentState } from '@/context-store/states/contextStoreCurrentObjectMetadataIdComponentState';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useObjectNameSingularFromPlural } from '@/object-metadata/hooks/useObjectNameSingularFromPlural';
import { useRecordIndexContextOrThrow } from '@/object-record/record-index/contexts/RecordIndexContext';
import { useSetRecoilComponentStateV2 } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentStateV2';
import { useEffect } from 'react';

export const RecordIndexContainerContextStoreObjectMetadataEffect = () => {
  const setContextStoreCurrentObjectMetadataItem = useSetRecoilComponentStateV2(
    contextStoreCurrentObjectMetadataIdComponentState,
  );
  const { objectNamePlural } = useRecordIndexContextOrThrow();

  const { objectNameSingular } = useObjectNameSingularFromPlural({
    objectNamePlural,
  });

  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular,
  });

  useEffect(() => {
    setContextStoreCurrentObjectMetadataItem(objectMetadataItem.id);

    return () => {
      setContextStoreCurrentObjectMetadataItem(null);
    };
  }, [objectMetadataItem.id, setContextStoreCurrentObjectMetadataItem]);

  return null;
};
