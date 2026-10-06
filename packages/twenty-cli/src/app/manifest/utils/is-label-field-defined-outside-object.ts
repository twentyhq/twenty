import { isDefined } from 'twenty-shared/utils';

export const isLabelFieldDefinedOutsideObject = ({
  fields,
  labelIdentifierFieldMetadataUniversalIdentifier,
}: {
  fields: { universalIdentifier?: string }[];
  labelIdentifierFieldMetadataUniversalIdentifier?: string;
}): boolean =>
  isDefined(labelIdentifierFieldMetadataUniversalIdentifier) &&
  !fields.some(
    (field) =>
      field.universalIdentifier?.toLowerCase() ===
      labelIdentifierFieldMetadataUniversalIdentifier?.toLowerCase(),
  );
