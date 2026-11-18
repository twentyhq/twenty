import { recordFieldLookupTargetFamilySelector } from '@/object-record/record-column-lookup/states/recordFieldLookupTargetFamilySelector';
import { type RecordField } from '@/object-record/record-field/types/RecordField';
import { useAtomFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilySelectorValue';

export const useRecordFieldLookupTarget = (
  recordField: Pick<
    RecordField,
    'fieldMetadataItemId' | 'relationTargetFieldMetadataId'
  >,
) =>
  useAtomFamilySelectorValue(recordFieldLookupTargetFamilySelector, {
    fieldMetadataItemId: recordField.fieldMetadataItemId,
    relationTargetFieldMetadataId: recordField.relationTargetFieldMetadataId,
  });
