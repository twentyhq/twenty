import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { flattenedFieldMetadataItemsSelector } from '@/object-metadata/states/flattenedFieldMetadataItemsSelector';
import { isLookupColumnsEnabledSelector } from '@/object-record/record-column-lookup/states/isLookupColumnsEnabledSelector';
import { type RecordFieldColumnKind } from '@/object-record/record-column-scope/types/RecordFieldColumnKind';
import { type ScopedRelationAlias } from '@/object-record/record-column-scope/types/ScopedRelationAlias';
import { getRecordFieldColumnKind } from '@/object-record/record-column-scope/utils/getRecordFieldColumnKind';
import { getScopedRelationAliases } from '@/object-record/record-column-scope/utils/getScopedRelationAliases';
import { visibleRecordFieldsComponentSelector } from '@/object-record/record-field/states/visibleRecordFieldsComponentSelector';
import { useFilterValueDependencies } from '@/object-record/record-filter/hooks/useFilterValueDependencies';
import { useRecordIndexContextOrThrow } from '@/object-record/record-index/contexts/RecordIndexContext';
import { useAtomComponentSelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentSelectorValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useMemo } from 'react';

export const useScopedRelationAliasesAndColumnKinds = (): {
  scopedRelationAliases: ScopedRelationAlias[];
  columnKindByRecordFieldId: Record<string, RecordFieldColumnKind>;
} => {
  const isLookupColumnsEnabled = useAtomStateValue(
    isLookupColumnsEnabledSelector,
  );
  const visibleRecordFields = useAtomComponentSelectorValue(
    visibleRecordFieldsComponentSelector,
  );
  const { fieldMetadataItemByFieldMetadataItemId } =
    useRecordIndexContextOrThrow();
  const { objectMetadataItems } = useObjectMetadataItems();
  const flattenedFieldMetadataItems = useAtomStateValue(
    flattenedFieldMetadataItemsSelector,
  );
  const { filterValueDependencies } = useFilterValueDependencies();

  return useMemo(() => {
    const scopedRelationAliases = getScopedRelationAliases({
      recordFields: visibleRecordFields,
      fieldMetadataItemByFieldMetadataItemId,
      objectMetadataItems,
      fieldMetadataItems: flattenedFieldMetadataItems,
      filterValueDependencies,
      isLookupColumnsEnabled,
    });

    return {
      scopedRelationAliases,
      columnKindByRecordFieldId: Object.fromEntries(
        visibleRecordFields.map((recordField) => [
          recordField.id,
          getRecordFieldColumnKind({
            recordField,
            fieldMetadataItem:
              fieldMetadataItemByFieldMetadataItemId[
                recordField.fieldMetadataItemId
              ],
            scopedRelationAlias: scopedRelationAliases.find(
              ({ recordFieldId }) => recordFieldId === recordField.id,
            ),
            objectMetadataItems,
            isLookupColumnsEnabled,
          }),
        ]),
      ),
    };
  }, [
    visibleRecordFields,
    fieldMetadataItemByFieldMetadataItemId,
    objectMetadataItems,
    flattenedFieldMetadataItems,
    filterValueDependencies,
    isLookupColumnsEnabled,
  ]);
};
