import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { useRecordTableContextOrThrow } from '@/object-record/record-table/contexts/RecordTableContext';
import { useEffect } from 'react';

export const RecordTableVirtualizedEvictRecordsCacheOnUnmountEffect = () => {
  const { objectMetadataItem } = useRecordTableContextOrThrow();
  const apolloCoreClient = useApolloCoreClient();

  const objectNamePlural = objectMetadataItem.namePlural;

  useEffect(() => {
    return () => {
      apolloCoreClient.cache.evict({
        id: 'ROOT_QUERY',
        fieldName: objectNamePlural,
        broadcast: false,
      });
    };
  }, [apolloCoreClient, objectNamePlural]);

  return null;
};
