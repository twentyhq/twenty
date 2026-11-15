import { getLookupColumns } from '@/object-record/record-column-lookup/utils/getLookupColumns';
import { visibleRecordFieldsComponentSelector } from '@/object-record/record-field/states/visibleRecordFieldsComponentSelector';
import { useRecordIndexContextOrThrow } from '@/object-record/record-index/contexts/RecordIndexContext';
import { useAtomComponentSelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentSelectorValue';
import { useMemo } from 'react';

export const useRecordIndexLookupColumns = () => {
  const visibleRecordFields = useAtomComponentSelectorValue(
    visibleRecordFieldsComponentSelector,
  );
  const { columnDescriptorByRecordFieldId } = useRecordIndexContextOrThrow();

  // Memoized: feeds query fingerprints and loader dependencies
  return useMemo(
    () =>
      getLookupColumns({
        recordFields: visibleRecordFields,
        columnDescriptorByRecordFieldId,
      }),
    [visibleRecordFields, columnDescriptorByRecordFieldId],
  );
};
