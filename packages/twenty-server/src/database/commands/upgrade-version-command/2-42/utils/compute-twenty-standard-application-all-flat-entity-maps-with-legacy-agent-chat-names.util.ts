import { applyLegacyAgentChatNameAndJoinColumnNameToFlatFieldMetadata } from 'src/database/commands/upgrade-version-command/2-42/utils/apply-legacy-agent-chat-name-and-join-column-name-to-flat-field-metadata.util';
import { applyLegacyAgentChatNameToFlatIndexMetadata } from 'src/database/commands/upgrade-version-command/2-42/utils/apply-legacy-agent-chat-name-to-flat-index-metadata.util';
import { applyLegacyAgentChatNamesToFlatObjectMetadata } from 'src/database/commands/upgrade-version-command/2-42/utils/apply-legacy-agent-chat-names-to-flat-object-metadata.util';
import { transformEachFlatEntityInFlatEntityMaps } from 'src/database/commands/upgrade-version-command/2-42/utils/transform-each-flat-entity-in-flat-entity-maps.util';
import {
  type ComputeTwentyStandardApplicationAllFlatEntityMapsArgs,
  computeTwentyStandardApplicationAllFlatEntityMaps,
} from 'src/engine/workspace-manager/twenty-standard-application/utils/twenty-standard-application-all-flat-entity-maps.constant';

export const computeTwentyStandardApplicationAllFlatEntityMapsWithLegacyAgentChatNames =
  (
    computeTwentyStandardApplicationAllFlatEntityMapsArgs: ComputeTwentyStandardApplicationAllFlatEntityMapsArgs,
  ): ReturnType<typeof computeTwentyStandardApplicationAllFlatEntityMaps> => {
    const {
      allFlatEntityMaps: allFlatEntityMapsWithCurrentNames,
      idByUniversalIdentifierByMetadataName,
    } = computeTwentyStandardApplicationAllFlatEntityMaps(
      computeTwentyStandardApplicationAllFlatEntityMapsArgs,
    );

    return {
      idByUniversalIdentifierByMetadataName,
      allFlatEntityMaps: {
        ...allFlatEntityMapsWithCurrentNames,
        flatObjectMetadataMaps: transformEachFlatEntityInFlatEntityMaps({
          flatEntityMaps:
            allFlatEntityMapsWithCurrentNames.flatObjectMetadataMaps,
          transformFlatEntity: applyLegacyAgentChatNamesToFlatObjectMetadata,
        }),
        flatFieldMetadataMaps: transformEachFlatEntityInFlatEntityMaps({
          flatEntityMaps:
            allFlatEntityMapsWithCurrentNames.flatFieldMetadataMaps,
          transformFlatEntity:
            applyLegacyAgentChatNameAndJoinColumnNameToFlatFieldMetadata,
        }),
        flatIndexMaps: transformEachFlatEntityInFlatEntityMaps({
          flatEntityMaps: allFlatEntityMapsWithCurrentNames.flatIndexMaps,
          transformFlatEntity: applyLegacyAgentChatNameToFlatIndexMetadata,
        }),
      },
    };
  };
