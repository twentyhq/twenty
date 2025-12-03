import { TWENTY_STANDARD_APPLICATION } from 'src/engine/core-modules/application/constants/twenty-standard-applications';
import { AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';

import { buildStandardFlatObjectMetadatas } from './standard-flat-object-metadata.constant';

const TWENTY_STANDARD_APPLICATION_ID =
  TWENTY_STANDARD_APPLICATION.universalIdentifier;

export const buildTwentyStandardApplicationAllFlatEntityMaps = (
  createdAt: Date,
): AllFlatEntityMaps => {
  const standardFlatObjectMetadatas = buildStandardFlatObjectMetadatas(createdAt);

  // Build the byId map
  const flatObjectMetadataById: Record<string, FlatObjectMetadata> =
    Object.fromEntries(
      Object.values(standardFlatObjectMetadatas).map((metadata) => [
        metadata.id,
        metadata,
      ]),
    );

  // Build the idByUniversalIdentifier map
  const flatObjectMetadataIdByUniversalIdentifier: Record<string, string> =
    Object.fromEntries(
      Object.values(standardFlatObjectMetadatas).map((metadata) => [
        metadata.universalIdentifier,
        metadata.id,
      ]),
    );

  // Build the universalIdentifiersByApplicationId map
  const flatObjectMetadataUniversalIdentifiersByApplicationId: Record<
    string,
    string[]
  > = {
    [TWENTY_STANDARD_APPLICATION_ID]: Object.values(
      standardFlatObjectMetadatas,
    ).map((metadata) => metadata.universalIdentifier),
  };

  return {
    flatAgentMaps: {
      byId: {},
      idByUniversalIdentifier: {},
      universalIdentifiersByApplicationId: {},
    },
    flatCronTriggerMaps: {
      byId: {},
      idByUniversalIdentifier: {},
      universalIdentifiersByApplicationId: {},
    },
    flatDatabaseEventTriggerMaps: {
      byId: {},
      idByUniversalIdentifier: {},
      universalIdentifiersByApplicationId: {},
    },
    flatFieldMetadataMaps: {
      byId: {},
      idByUniversalIdentifier: {},
      universalIdentifiersByApplicationId: {},
    },
    flatIndexMaps: {
      byId: {},
      idByUniversalIdentifier: {},
      universalIdentifiersByApplicationId: {},
    },
    flatObjectMetadataMaps: {
      byId: flatObjectMetadataById,
      idByUniversalIdentifier: flatObjectMetadataIdByUniversalIdentifier,
      universalIdentifiersByApplicationId:
        flatObjectMetadataUniversalIdentifiersByApplicationId,
    },
    flatRoleMaps: {
      byId: {},
      idByUniversalIdentifier: {},
      universalIdentifiersByApplicationId: {},
    },
    flatRoleTargetMaps: {
      byId: {},
      idByUniversalIdentifier: {},
      universalIdentifiersByApplicationId: {},
    },
    flatRouteTriggerMaps: {
      byId: {},
      idByUniversalIdentifier: {},
      universalIdentifiersByApplicationId: {},
    },
    flatServerlessFunctionMaps: {
      byId: {},
      idByUniversalIdentifier: {},
      universalIdentifiersByApplicationId: {},
    },
    flatViewFieldMaps: {
      byId: {},
      idByUniversalIdentifier: {},
      universalIdentifiersByApplicationId: {},
    },
    flatViewFilterMaps: {
      byId: {},
      idByUniversalIdentifier: {},
      universalIdentifiersByApplicationId: {},
    },
    flatViewGroupMaps: {
      byId: {},
      idByUniversalIdentifier: {},
      universalIdentifiersByApplicationId: {},
    },
    flatViewMaps: {
      byId: {},
      idByUniversalIdentifier: {},
      universalIdentifiersByApplicationId: {},
    },
  };
};
