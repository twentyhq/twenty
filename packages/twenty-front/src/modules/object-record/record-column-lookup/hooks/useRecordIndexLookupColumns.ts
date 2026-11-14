import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
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
  const { objectMetadataItems } = useObjectMetadataItems();

  // Memoized: both results feed query fingerprints and loader dependencies
  const lookupColumns = useMemo(
    () =>
      getLookupColumns({
        recordFields: visibleRecordFields,
        fieldMetadataItemByFieldMetadataItemId,
        objectMetadataItems,
      }),
    [
      visibleRecordFields,
      fieldMetadataItemByFieldMetadataItemId,
      objectMetadataItems,
    ],
  );

  const lookupRelationFieldNames = useMemo(
    () => lookupColumns.map(({ relationFieldName }) => relationFieldName),
    [lookupColumns],
  );

  return { lookupColumns, lookupRelationFieldNames };
};
