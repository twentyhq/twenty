import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { isFieldFullName } from '@/object-record/record-field/ui/types/guards/isFieldFullName';
import { isFieldNumber } from '@/object-record/record-field/ui/types/guards/isFieldNumber';
import { isFieldText } from '@/object-record/record-field/ui/types/guards/isFieldText';

export const isFieldIdentifierDisplay = (
  field: Pick<FieldMetadataItem, 'type'>,
  isLabelIdentifier: boolean,
) =>
  isLabelIdentifier &&
  (isFieldText(field) || isFieldFullName(field) || isFieldNumber(field));
