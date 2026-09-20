import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';

import { type InputAskStandardUniversalIdentifiers } from 'src/database/commands/upgrade-version-command/2-42/types/input-ask-standard-universal-identifiers.type';
import { type TwentyStandardAllFlatEntityMaps } from 'src/engine/workspace-manager/twenty-standard-application/types/twenty-standard-all-flat-entity-maps.type';

const INPUT_ASK_OBJECT_UNIVERSAL_IDENTIFIER =
  STANDARD_OBJECTS.inputAsk.universalIdentifier;

export const collectInputAskStandardUniversalIdentifiers = ({
  standardAllFlatEntityMaps,
}: {
  standardAllFlatEntityMaps: TwentyStandardAllFlatEntityMaps;
}): InputAskStandardUniversalIdentifiers => {
  // The inverse sides of inputAsk's relations live on workflowRun and
  // workspaceMember, so a filter on the owning object alone would create the
  // relation half-built and leave those objects without their inputAsks field.
  const fieldMetadata = Object.values(
    standardAllFlatEntityMaps.flatFieldMetadataMaps.byUniversalIdentifier,
  )
    .filter(isDefined)
    .filter(
      (flatFieldMetadata) =>
        flatFieldMetadata.objectMetadataUniversalIdentifier ===
          INPUT_ASK_OBJECT_UNIVERSAL_IDENTIFIER ||
        flatFieldMetadata.relationTargetObjectMetadataUniversalIdentifier ===
          INPUT_ASK_OBJECT_UNIVERSAL_IDENTIFIER,
    )
    .map((flatFieldMetadata) => flatFieldMetadata.universalIdentifier);

  const index = Object.values(
    standardAllFlatEntityMaps.flatIndexMaps.byUniversalIdentifier,
  )
    .filter(isDefined)
    .filter(
      (flatIndexMetadata) =>
        flatIndexMetadata.objectMetadataUniversalIdentifier ===
        INPUT_ASK_OBJECT_UNIVERSAL_IDENTIFIER,
    )
    .map((flatIndexMetadata) => flatIndexMetadata.universalIdentifier);

  const searchFieldMetadata = Object.values(
    standardAllFlatEntityMaps.flatSearchFieldMetadataMaps.byUniversalIdentifier,
  )
    .filter(isDefined)
    .filter(
      (flatSearchFieldMetadata) =>
        flatSearchFieldMetadata.objectMetadataUniversalIdentifier ===
        INPUT_ASK_OBJECT_UNIVERSAL_IDENTIFIER,
    )
    .map(
      (flatSearchFieldMetadata) => flatSearchFieldMetadata.universalIdentifier,
    );

  const flatViews = Object.values(
    standardAllFlatEntityMaps.flatViewMaps.byUniversalIdentifier,
  )
    .filter(isDefined)
    .filter(
      (flatView) =>
        flatView.objectMetadataUniversalIdentifier ===
        INPUT_ASK_OBJECT_UNIVERSAL_IDENTIFIER,
    );
  const viewUniversalIdentifiers = new Set(
    flatViews.map((flatView) => flatView.universalIdentifier),
  );

  const viewFieldGroup = Object.values(
    standardAllFlatEntityMaps.flatViewFieldGroupMaps.byUniversalIdentifier,
  )
    .filter(isDefined)
    .filter((flatViewFieldGroup) =>
      viewUniversalIdentifiers.has(flatViewFieldGroup.viewUniversalIdentifier),
    )
    .map((flatViewFieldGroup) => flatViewFieldGroup.universalIdentifier);

  const viewField = Object.values(
    standardAllFlatEntityMaps.flatViewFieldMaps.byUniversalIdentifier,
  )
    .filter(isDefined)
    .filter((flatViewField) =>
      viewUniversalIdentifiers.has(flatViewField.viewUniversalIdentifier),
    )
    .map((flatViewField) => flatViewField.universalIdentifier);

  return {
    objectMetadata: [INPUT_ASK_OBJECT_UNIVERSAL_IDENTIFIER],
    fieldMetadata,
    index,
    searchFieldMetadata,
    view: flatViews.map((flatView) => flatView.universalIdentifier),
    viewFieldGroup,
    viewField,
  };
};
