import { useEffect } from 'react';

import { useResetTableRowSelection } from '@/object-record/record-table/hooks/internal/useResetTableRowSelection';
import { useRecordIndexContextOrThrow } from '@/object-record/record-index/contexts/RecordIndexContext';

export const RecordIndexResetSelectionEffect = () => {
  const { recordIndexId } = useRecordIndexContextOrThrow();
  const resetTableRowSelection = useResetTableRowSelection(recordIndexId);

  useEffect(() => {
    return () => {
      resetTableRowSelection();
    };
  }, [resetTableRowSelection]);

  return null;
};
