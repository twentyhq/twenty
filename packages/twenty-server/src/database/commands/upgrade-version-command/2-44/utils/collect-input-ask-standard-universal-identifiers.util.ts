import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';

import { type SyncableFlatEntity } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-from.type';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type TwentyStandardAllFlatEntityMaps } from 'src/engine/workspace-manager/twenty-standard-application/types/twenty-standard-all-flat-entity-maps.type';

const INPUT_ASK_OBJECT_UNIVERSAL_IDENTIFIER =
  STANDARD_OBJECTS.inputAsk.universalIdentifier;

const collectUniversalIdentifiers = <TFlatEntity extends SyncableFlatEntity>(
  flatEntityMaps: FlatEntityMaps<TFlatEntity>,
  isInputAskEntity: (flatEntity: NoInfer<TFlatEntity>) => boolean,
) =>
  Object.values(flatEntityMaps.byUniversalIdentifier)
    .filter(isDefined)
    .filter(isInputAskEntity)
    .map(({ universalIdentifier }) => universalIdentifier);

const isOnInputAsk = ({
  objectMetadataUniversalIdentifier,
}: {
  objectMetadataUniversalIdentifier: string | null;
}) =>
  objectMetadataUniversalIdentifier === INPUT_ASK_OBJECT_UNIVERSAL_IDENTIFIER;

export const collectInputAskStandardUniversalIdentifiers = ({
  standardAllFlatEntityMaps,
}: {
  standardAllFlatEntityMaps: TwentyStandardAllFlatEntityMaps;
}) => {
  const view = collectUniversalIdentifiers(
    standardAllFlatEntityMaps.flatViewMaps,
    isOnInputAsk,
  );
  const viewUniversalIdentifiers = new Set(view);

  return {
    objectMetadata: [INPUT_ASK_OBJECT_UNIVERSAL_IDENTIFIER],
    // The inverse sides of inputAsk's relations live on workflowRun,
    // agentChatThread and workspaceMember; filtering on the owning object alone
    // would create each relation half-built.
    fieldMetadata: collectUniversalIdentifiers(
      standardAllFlatEntityMaps.flatFieldMetadataMaps,
      (flatFieldMetadata) =>
        isOnInputAsk(flatFieldMetadata) ||
        flatFieldMetadata.relationTargetObjectMetadataUniversalIdentifier ===
          INPUT_ASK_OBJECT_UNIVERSAL_IDENTIFIER,
    ),
    index: collectUniversalIdentifiers(
      standardAllFlatEntityMaps.flatIndexMaps,
      isOnInputAsk,
    ),
    searchFieldMetadata: collectUniversalIdentifiers(
      standardAllFlatEntityMaps.flatSearchFieldMetadataMaps,
      isOnInputAsk,
    ),
    view,
    viewField: collectUniversalIdentifiers(
      standardAllFlatEntityMaps.flatViewFieldMaps,
      ({ viewUniversalIdentifier }) =>
        viewUniversalIdentifiers.has(viewUniversalIdentifier),
    ),
  };
};
