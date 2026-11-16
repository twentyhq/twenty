import { getAggregateColumns } from '@/object-record/record-column-aggregate/utils/getAggregateColumns';
import { visibleRecordFieldsComponentSelector } from '@/object-record/record-field/states/visibleRecordFieldsComponentSelector';
import { useRecordIndexContextOrThrow } from '@/object-record/record-index/contexts/RecordIndexContext';
import { useAtomComponentSelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentSelectorValue';
import { useMemo } from 'react';

export const useRecordIndexAggregateColumns = () => {
  const visibleRecordFields = useAtomComponentSelectorValue(
    visibleRecordFieldsComponentSelector,
  );
  const { columnDescriptorByRecordFieldId } = useRecordIndexContextOrThrow();

  // Memoized: feeds query fingerprints and loader dependencies
  return useMemo(
    () =>
      getAggregateColumns({
        recordFields: visibleRecordFields,
        columnDescriptorByRecordFieldId,
      }),
    [visibleRecordFields, columnDescriptorByRecordFieldId],
  );
};
