import {
  FieldDateDisplayFormat,
  type FieldMetadata,
} from '@/object-record/record-field/ui/types/FieldMetadata';
import { isFieldDate } from '@/object-record/record-field/ui/types/guards/isFieldDate';
import { isFieldDateTime } from '@/object-record/record-field/ui/types/guards/isFieldDateTime';
import { type ColumnDefinition } from '@/object-record/record-table/types/ColumnDefinition';
import { isDefined } from 'twenty-shared/utils';

export const getRecordListRowDateFieldDefinition = (
  fieldDefinition: ColumnDefinition<FieldMetadata> | undefined,
): ColumnDefinition<FieldMetadata> | undefined => {
  if (!isDefined(fieldDefinition)) {
    return undefined;
  }

  if (!isFieldDate(fieldDefinition) && !isFieldDateTime(fieldDefinition)) {
    return undefined;
  }

  return {
    ...fieldDefinition,
    metadata: {
      ...fieldDefinition.metadata,
      settings: { displayFormat: FieldDateDisplayFormat.RELATIVE },
    },
  };
};
