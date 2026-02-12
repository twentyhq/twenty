import { FieldContext } from '@/object-record/record-field/ui/contexts/FieldContext';
import { type FieldDefinition } from '@/object-record/record-field/ui/types/FieldDefinition';
import {
  type FieldFilesMetadata,
  type FieldFilesValue,
} from '@/object-record/record-field/ui/types/FieldMetadata';
import { useRecordFieldValueV2 } from '@/object-record/record-store/hooks/useRecordFieldValueV2';

import { useContext } from 'react';

export const useFilesFieldDisplay = () => {
  const { recordId, fieldDefinition, disableChipClick } =
    useContext(FieldContext);

  const { fieldName } = fieldDefinition.metadata;

  const fieldValue = useRecordFieldValueV2<FieldFilesValue[] | undefined>(
    recordId,
    fieldName,
    fieldDefinition,
  );

  return {
    fieldDefinition: fieldDefinition as FieldDefinition<FieldFilesMetadata>,
    fieldValue,
    disableChipClick,
  };
};
