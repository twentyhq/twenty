import { isDefined } from 'twenty-shared/utils';

import { type AllFlatEntityOperationByMetadataName } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-to-create-delete-update.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';

export const buildMorphJunctionReferenceUpdates = ({
  fields,
  replacementByUniversalIdentifier,
}: {
  fields: FlatFieldMetadata[];
  replacementByUniversalIdentifier: Map<string, FlatFieldMetadata>;
}): NonNullable<AllFlatEntityOperationByMetadataName['fieldMetadata']> => {
  const operations: NonNullable<
    AllFlatEntityOperationByMetadataName['fieldMetadata']
  > = {
    flatEntityToCreate: [],
    flatEntityToUpdate: [],
    flatEntityToDelete: [],
  };

  for (const field of fields) {
    const settings = field.universalSettings;
    if (
      !isDefined(settings) ||
      !('junctionTargetFieldUniversalIdentifier' in settings) ||
      !isDefined(settings.junctionTargetFieldUniversalIdentifier)
    )
      continue;
    const replacement = replacementByUniversalIdentifier.get(
      settings.junctionTargetFieldUniversalIdentifier,
    );
    if (isDefined(replacement)) {
      operations.flatEntityToUpdate.push({
        ...field,
        universalSettings: {
          ...settings,
          junctionTargetFieldUniversalIdentifier:
            replacement.universalIdentifier,
        },
      });
    }
  }

  return operations;
};
