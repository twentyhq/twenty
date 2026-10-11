import { isDefined } from 'twenty-shared/utils';

import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { deleteUniversalFlatEntityFromUniversalFlatEntityMapsThroughMutationOrThrow } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/utils/delete-universal-flat-entity-from-universal-flat-entity-maps-through-mutation-or-throw.util';

export const moveLegacyMorphViewFieldsToOwner = ({
  flatViewFieldMaps,
  logicalIdentifierByTargetIdentifier,
}: Pick<AllFlatEntityMaps, 'flatViewFieldMaps'> & {
  logicalIdentifierByTargetIdentifier: Map<string, string>;
}): void => {
  const viewFields = Object.values(flatViewFieldMaps.byUniversalIdentifier)
    .filter(isDefined)
    .sort(
      (left, right) =>
        left.position - right.position ||
        left.universalIdentifier.localeCompare(right.universalIdentifier),
    );

  // Several target columns of one view collapse onto the same owner, and a view accepts each field once.
  const occupiedColumns = new Set(
    viewFields
      .filter(
        (viewField) =>
          !logicalIdentifierByTargetIdentifier.has(
            viewField.fieldMetadataUniversalIdentifier,
          ),
      )
      .map(
        (viewField) =>
          `${viewField.viewUniversalIdentifier}:${viewField.fieldMetadataUniversalIdentifier}`,
      ),
  );

  for (const viewField of viewFields) {
    const logicalIdentifier = logicalIdentifierByTargetIdentifier.get(
      viewField.fieldMetadataUniversalIdentifier,
    );

    if (!isDefined(logicalIdentifier)) continue;

    const column = `${viewField.viewUniversalIdentifier}:${logicalIdentifier}`;

    if (occupiedColumns.has(column)) {
      deleteUniversalFlatEntityFromUniversalFlatEntityMapsThroughMutationOrThrow(
        {
          universalIdentifierToDelete: viewField.universalIdentifier,
          universalFlatEntityMapsToMutate: flatViewFieldMaps,
        },
      );
      continue;
    }

    occupiedColumns.add(column);
    viewField.fieldMetadataUniversalIdentifier = logicalIdentifier;
  }
};
