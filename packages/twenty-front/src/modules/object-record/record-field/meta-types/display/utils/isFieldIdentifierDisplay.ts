import { FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { isFieldFullName } from '@/object-record/record-field/types/guards/isFieldFullName';
import { isFieldNumber } from '@/object-record/record-field/types/guards/isFieldNumber';
import { isFieldText } from '@/object-record/record-field/types/guards/isFieldText';

export const isFieldIdentifierDisplay = (
  field: Pick<FieldMetadataItem, 'type'>,
  isLabelIdentifier: boolean,
) =>
  isLabelIdentifier &&
  (isFieldText(field) || isFieldFullName(field) || isFieldNumber(field));
