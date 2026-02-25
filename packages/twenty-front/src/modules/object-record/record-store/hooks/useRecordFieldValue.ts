import { useAtomValue } from 'jotai';

import { type FieldDefinition } from '@/object-record/record-field/ui/types/FieldDefinition';
import { type FieldMetadata } from '@/object-record/record-field/ui/types/FieldMetadata';
import { recordStoreFieldValueSelector } from '@/object-record/record-store/states/selectors/recordStoreFieldValueSelector';

export const useRecordFieldValue = <T extends unknown>(
  recordId: string,
  fieldName: string,
  fieldDefinition: Pick<FieldDefinition<FieldMetadata>, 'type' | 'metadata'>,
) => {
  const fieldValue = recordStoreFieldValueSelector({
    recordId,
    fieldName,
    fieldDefinition: {
      type: fieldDefinition.type,
      metadata: fieldDefinition.metadata,
    },
  });

  return useAtomValue(fieldValue) as T | undefined;
};
