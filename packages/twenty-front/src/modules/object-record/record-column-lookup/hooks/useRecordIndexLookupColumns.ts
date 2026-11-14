import { useGetRecordFieldLookupTarget } from '@/object-record/record-column-lookup/hooks/useGetRecordFieldLookupTarget';
import { getLookupColumns } from '@/object-record/record-column-lookup/utils/getLookupColumns';
import { visibleRecordFieldsComponentSelector } from '@/object-record/record-field/states/visibleRecordFieldsComponentSelector';
import { useRecordIndexContextOrThrow } from '@/object-record/record-index/contexts/RecordIndexContext';
import { useAtomComponentSelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentSelectorValue';
import { useMemo } from 'react';

export const useRecordIndexLookupColumns = () => {
  const visibleRecordFields = useAtomComponentSelectorValue(
    visibleRecordFieldsComponentSelector,
  );
  const { fieldMetadataItemByFieldMetadataItemId } =
    useRecordIndexContextOrThrow();
  const getLookupTarget = useGetRecordFieldLookupTarget();

  // Memoized: both results feed query fingerprints and loader dependencies
  const lookupColumns = useMemo(
    () =>
      getLookupColumns({
        recordFields: visibleRecordFields,
        fieldMetadataItemByFieldMetadataItemId,
        getLookupTarget,
      }),
    [
      visibleRecordFields,
      fieldMetadataItemByFieldMetadataItemId,
      getLookupTarget,
    ],
  );

  const lookupRelationFieldNames = useMemo(
    () => lookupColumns.map(({ relationFieldName }) => relationFieldName),
    [lookupColumns],
  );

  return { lookupColumns, lookupRelationFieldNames };
};
