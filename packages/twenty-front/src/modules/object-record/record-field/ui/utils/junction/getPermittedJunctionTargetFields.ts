import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { isDefined } from 'twenty-shared/utils';

export const getPermittedJunctionTargetFields = <
  TPermittedField extends Pick<FieldMetadataItem, 'id'>,
>({
  targetFields,
  permittedFields,
}: {
  targetFields: Pick<FieldMetadataItem, 'id'>[];
  permittedFields: TPermittedField[];
}): TPermittedField[] =>
  targetFields
    .map((targetField) =>
      permittedFields.find(
        (permittedField) => permittedField.id === targetField.id,
      ),
    )
    .filter(isDefined);
