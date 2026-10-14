import { useCallback } from 'react';

import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useRefetchAggregateQueries } from '@/object-record/hooks/useRefetchAggregateQueries';
import { useResetVirtualizationBecauseDataChanged } from '@/object-record/record-table/virtualization/hooks/useResetVirtualizationBecauseDataChanged';

export const useReloadRecordTableBecauseDataChanged = (
  objectNameSingular: string,
) => {
  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular,
  });

  const { resetVirtualizationBecauseDataChanged } =
    useResetVirtualizationBecauseDataChanged(objectNameSingular);

  const { refetchAggregateQueries } = useRefetchAggregateQueries();

  const reloadRecordTableBecauseDataChanged = useCallback(async () => {
    await Promise.all([
      resetVirtualizationBecauseDataChanged(),
      refetchAggregateQueries({
        objectMetadataNamePlural: objectMetadataItem.namePlural,
      }),
    ]);
  }, [
    objectMetadataItem.namePlural,
    refetchAggregateQueries,
    resetVirtualizationBecauseDataChanged,
  ]);

  return { reloadRecordTableBecauseDataChanged };
};
