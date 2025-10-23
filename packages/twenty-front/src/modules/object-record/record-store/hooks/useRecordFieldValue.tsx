import { type FieldDefinition } from '@/object-record/record-field/ui/types/FieldDefinition';
import { type FieldMetadata } from '@/object-record/record-field/ui/types/FieldMetadata';
import { recordStoreFieldValueSelector } from '@/object-record/record-store/states/selectors/recordStoreFieldValueSelector';
import { useRecoilValue } from 'recoil';

export const useRecordFieldValue = <T,>(
  recordId: string,
  fieldName: string,
  fieldDefinition: FieldDefinition<FieldMetadata>,
) => {
  const recordFieldValue = useRecoilValue(
    recordStoreFieldValueSelector({
      recordId,
      fieldName,
      fieldDefinition: {
        type: fieldDefinition.type,
        metadata: fieldDefinition.metadata,
      },
    }),
  ) as T | undefined;

  return recordFieldValue;
};
