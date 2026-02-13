import { useAtomValue } from 'jotai';

import { type FieldDefinition } from '@/object-record/record-field/ui/types/FieldDefinition';
import { type FieldMetadata } from '@/object-record/record-field/ui/types/FieldMetadata';
import { recordStoreFieldValueSelectorV2 } from '@/object-record/record-store/states/selectors/recordStoreFieldValueSelectorV2';

export const useRecordFieldValueV2 = <T extends unknown>(
  recordId: string,
  fieldName: string,
  fieldDefinition: Pick<FieldDefinition<FieldMetadata>, 'type' | 'metadata'>,
) => {
  const fieldValueAtom = recordStoreFieldValueSelectorV2({
    recordId,
    fieldName,
    fieldDefinition: {
      type: fieldDefinition.type,
      metadata: fieldDefinition.metadata,
    },
  });

  return useAtomValue(fieldValueAtom) as T | undefined;
};
