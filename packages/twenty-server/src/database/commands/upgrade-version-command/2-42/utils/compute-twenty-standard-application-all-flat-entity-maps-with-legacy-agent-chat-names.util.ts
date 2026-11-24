import { isDefined } from 'twenty-shared/utils';

import { LEGACY_AGENT_CHAT_INDEX_NAMES_BY_UNIVERSAL_IDENTIFIER } from 'src/database/commands/upgrade-version-command/2-42/constants/legacy-agent-chat-index-names-by-universal-identifier.constant';
import { LEGACY_AGENT_CHAT_OBJECT_NAMES_BY_UNIVERSAL_IDENTIFIER } from 'src/database/commands/upgrade-version-command/2-42/constants/legacy-agent-chat-object-names-by-universal-identifier.constant';
import { LEGACY_AGENT_CHAT_RELATION_FIELD_NAMES_BY_UNIVERSAL_IDENTIFIER } from 'src/database/commands/upgrade-version-command/2-42/constants/legacy-agent-chat-relation-field-names-by-universal-identifier.constant';
import { type SyncableFlatEntity } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-from.type';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { isMorphOrRelationFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-morph-or-relation-flat-field-metadata.util';
import {
  type ComputeTwentyStandardApplicationAllFlatEntityMapsArgs,
  computeTwentyStandardApplicationAllFlatEntityMaps,
} from 'src/engine/workspace-manager/twenty-standard-application/utils/twenty-standard-application-all-flat-entity-maps.constant';

const mapFlatEntities = <T extends SyncableFlatEntity>({
  flatEntityMaps,
  mapFlatEntity,
}: {
  flatEntityMaps: FlatEntityMaps<T>;
  mapFlatEntity: (flatEntity: T) => T;
}): FlatEntityMaps<T> => ({
  ...flatEntityMaps,
  byUniversalIdentifier: Object.fromEntries(
    Object.entries(flatEntityMaps.byUniversalIdentifier).map(
      ([universalIdentifier, flatEntity]) => [
        universalIdentifier,
        isDefined(flatEntity) ? mapFlatEntity(flatEntity) : flatEntity,
      ],
    ),
  ),
});

const applyLegacyRelationFieldName = (
  flatFieldMetadata: FlatFieldMetadata,
): FlatFieldMetadata => {
  const legacyNames =
    LEGACY_AGENT_CHAT_RELATION_FIELD_NAMES_BY_UNIVERSAL_IDENTIFIER[
      flatFieldMetadata.universalIdentifier
    ];

  if (!isDefined(legacyNames)) {
    return flatFieldMetadata;
  }

  const { name, joinColumnName } = legacyNames;

  if (
    !isDefined(joinColumnName) ||
    !isMorphOrRelationFlatFieldMetadata(flatFieldMetadata)
  ) {
    return { ...flatFieldMetadata, name };
  }

  return {
    ...flatFieldMetadata,
    name,
    settings: { ...flatFieldMetadata.settings, joinColumnName },
    universalSettings: {
      ...flatFieldMetadata.universalSettings,
      joinColumnName,
    },
  };
};

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
          mapFlatEntity: (flatObjectMetadata) => ({
            ...flatObjectMetadata,
            ...LEGACY_AGENT_CHAT_OBJECT_NAMES_BY_UNIVERSAL_IDENTIFIER[
              flatObjectMetadata.universalIdentifier
            ],
          }),
        }),
        flatFieldMetadataMaps: mapFlatEntities({
          flatEntityMaps: allFlatEntityMaps.flatFieldMetadataMaps,
          mapFlatEntity: applyLegacyRelationFieldName,
        }),
        flatIndexMaps: mapFlatEntities({
          flatEntityMaps: allFlatEntityMaps.flatIndexMaps,
          mapFlatEntity: (flatIndexMetadata) => ({
            ...flatIndexMetadata,
            name:
              LEGACY_AGENT_CHAT_INDEX_NAMES_BY_UNIVERSAL_IDENTIFIER[
                flatIndexMetadata.universalIdentifier
              ] ?? flatIndexMetadata.name,
          }),
        }),
      },
    };
  };
