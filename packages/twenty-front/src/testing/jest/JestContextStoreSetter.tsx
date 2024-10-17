import { ReactNode, useEffect, useState } from 'react';
import { useSetRecoilState } from 'recoil';

import { contextStoreCurrentObjectMetadataIdState } from '@/context-store/states/contextStoreCurrentObjectMetadataIdState';
import { contextStoreTargetedRecordsFiltersState } from '@/context-store/states/contextStoreTargetedRecordsFilters';
import { contextStoreTargetedRecordsState } from '@/context-store/states/contextStoreTargetedRecordsState';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';

export const JestContextStoreSetter = ({
  contextStoreTargetedRecords = {
    selectedRecordIds: 'all',
    excludedRecordIds: [],
  },
  contextStoreCurrentObjectMetadataNameSingular = '',
  contextStoreTargetedRecordsFilters = [],
  children,
}: {
  contextStoreTargetedRecords?: {
    selectedRecordIds: string[] | 'all';
    excludedRecordIds: string[];
  };
  contextStoreCurrentObjectMetadataNameSingular?: string;
  contextStoreTargetedRecordsFilters?: [];
  children: ReactNode;
}) => {
  const setContextStoreTargetedRecords = useSetRecoilState(
    contextStoreTargetedRecordsState,
  );
  const setContextStoreCurrentObjectMetadataId = useSetRecoilState(
    contextStoreCurrentObjectMetadataIdState,
  );
  const setContextStoreTargetedRecordsFilters = useSetRecoilState(
    contextStoreTargetedRecordsFiltersState,
  );

  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular: contextStoreCurrentObjectMetadataNameSingular,
  });

  const contextStoreCurrentObjectMetadataId = objectMetadataItem.id;

  const [isLoaded, setIsLoaded] = useState(false);
  useEffect(() => {
    setContextStoreTargetedRecords(contextStoreTargetedRecords);
    setContextStoreCurrentObjectMetadataId(contextStoreCurrentObjectMetadataId);
    setContextStoreTargetedRecordsFilters(contextStoreTargetedRecordsFilters);
    setIsLoaded(true);
  }, [
    setContextStoreTargetedRecords,
    setContextStoreCurrentObjectMetadataId,
    setContextStoreTargetedRecordsFilters,
    contextStoreTargetedRecords,
    contextStoreCurrentObjectMetadataId,
    contextStoreTargetedRecordsFilters,
  ]);

  return isLoaded ? <>{children}</> : null;
};
