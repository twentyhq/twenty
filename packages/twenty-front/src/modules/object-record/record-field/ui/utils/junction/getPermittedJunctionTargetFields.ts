import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { isDefined } from 'twenty-shared/utils';

export const getPermittedJunctionTargetFields = ({
  targetFields,
  permittedFields,
}: {
  targetFields: Pick<FieldMetadataItem, 'id'>[];
  permittedFields: FieldMetadataItem[];
}): FieldMetadataItem[] =>
  targetFields
    .map((targetField) =>
      permittedFields.find(
        (permittedField) => permittedField.id === targetField.id,
      ),
    )
    .filter(isDefined);
