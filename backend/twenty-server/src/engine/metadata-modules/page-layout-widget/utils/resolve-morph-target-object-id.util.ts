import { isDefined } from 'twenty-shared/utils';

import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';

export const resolveMorphTargetObjectId = ({
  field,
  allFields,
}: {
  field: FlatFieldMetadata;
  allFields: FlatFieldMetadata[];
}): string | null => {
  if (!isDefined(field.morphId)) {
    return null;
  }

  const targetIds = new Set<string>();

  allFields.forEach((flatField) => {
    if (
      flatField.morphId === field.morphId &&
      isDefined(flatField.relationTargetObjectMetadataId)
    ) {
      targetIds.add(flatField.relationTargetObjectMetadataId);
    }
  });

  if (targetIds.size !== 1) {
    return null;
  }

  return [...targetIds][0] ?? null;
};
