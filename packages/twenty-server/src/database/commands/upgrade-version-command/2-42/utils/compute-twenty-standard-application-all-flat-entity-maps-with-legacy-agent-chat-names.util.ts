import { applyLegacyAgentChatIndexName } from 'src/database/commands/upgrade-version-command/2-42/utils/apply-legacy-agent-chat-index-name.util';
import { applyLegacyAgentChatObjectNames } from 'src/database/commands/upgrade-version-command/2-42/utils/apply-legacy-agent-chat-object-names.util';
import { applyLegacyAgentChatRelationFieldName } from 'src/database/commands/upgrade-version-command/2-42/utils/apply-legacy-agent-chat-relation-field-name.util';
import { mapFlatEntities } from 'src/database/commands/upgrade-version-command/2-42/utils/map-flat-entities.util';
import {
  type ComputeTwentyStandardApplicationAllFlatEntityMapsArgs,
  computeTwentyStandardApplicationAllFlatEntityMaps,
} from 'src/engine/workspace-manager/twenty-standard-application/utils/twenty-standard-application-all-flat-entity-maps.constant';

export const computeTwentyStandardApplicationAllFlatEntityMapsWithLegacyAgentChatNames =
  (
    args: ComputeTwentyStandardApplicationAllFlatEntityMapsArgs,
  ): ReturnType<typeof computeTwentyStandardApplicationAllFlatEntityMaps> => {
    const { allFlatEntityMaps, idByUniversalIdentifierByMetadataName } =
      computeTwentyStandardApplicationAllFlatEntityMaps(args);

    return {
      idByUniversalIdentifierByMetadataName,
      allFlatEntityMaps: {
        ...allFlatEntityMaps,
        flatObjectMetadataMaps: mapFlatEntities({
          flatEntityMaps: allFlatEntityMaps.flatObjectMetadataMaps,
          mapFlatEntity: applyLegacyAgentChatObjectNames,
        }),
        flatFieldMetadataMaps: mapFlatEntities({
          flatEntityMaps: allFlatEntityMaps.flatFieldMetadataMaps,
          mapFlatEntity: applyLegacyAgentChatRelationFieldName,
        }),
        flatIndexMaps: mapFlatEntities({
          flatEntityMaps: allFlatEntityMaps.flatIndexMaps,
          mapFlatEntity: applyLegacyAgentChatIndexName,
        }),
      },
    };
  };
