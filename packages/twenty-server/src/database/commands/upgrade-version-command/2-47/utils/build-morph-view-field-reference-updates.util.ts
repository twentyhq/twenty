import { getSystemViewFieldUniversalIdentifier } from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';

import { type AllFlatEntityOperationByMetadataName } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-to-create-delete-update.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';

export const buildMorphViewFieldReferenceUpdates = ({
  flatViewFieldMaps,
  replacementByFieldId,
}: Pick<AllFlatEntityMaps, 'flatViewFieldMaps'> & {
  replacementByFieldId: Map<string, FlatFieldMetadata>;
}): NonNullable<AllFlatEntityOperationByMetadataName['viewField']> => {
  const operations: NonNullable<
    AllFlatEntityOperationByMetadataName['viewField']
  > = {
    flatEntityToCreate: [],
    flatEntityToUpdate: [],
    flatEntityToDelete: [],
  };

  const viewFields = Object.values(flatViewFieldMaps.byUniversalIdentifier)
    .filter(isDefined)
    .sort(
      (left, right) =>
        left.position - right.position || left.id.localeCompare(right.id),
    );
  const occupiedColumns = new Set(
    viewFields
      .filter((field) => !replacementByFieldId.has(field.fieldMetadataId))
      .map((field) => `${field.viewId}:${field.fieldMetadataId}`),
  );
  for (const viewField of viewFields) {
    const replacement = replacementByFieldId.get(viewField.fieldMetadataId);
    if (!isDefined(replacement)) continue;
    const key = `${viewField.viewId}:${replacement.id}`;
    if (occupiedColumns.has(key)) {
      operations.flatEntityToDelete.push(viewField);
    } else {
      occupiedColumns.add(key);
      const updatedViewField = {
        ...viewField,
        fieldMetadataUniversalIdentifier: replacement.universalIdentifier,
      };
      if (viewField.isSystemSideEffect) {
        operations.flatEntityToDelete.push(viewField);
        operations.flatEntityToCreate.push({
          ...updatedViewField,
          universalIdentifier: getSystemViewFieldUniversalIdentifier({
            fieldMetadataApplicationUniversalIdentifier:
              replacement.applicationUniversalIdentifier,
            fieldMetadataUniversalIdentifier: replacement.universalIdentifier,
            viewUniversalIdentifier: viewField.viewUniversalIdentifier,
          }),
        });
      } else {
        operations.flatEntityToUpdate.push(updatedViewField);
      }
    }
  }

  return operations;
};
