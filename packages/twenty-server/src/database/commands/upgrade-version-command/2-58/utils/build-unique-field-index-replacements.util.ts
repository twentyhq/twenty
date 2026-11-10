import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

import { INDEX_LEVEL_UNIQUE_STANDARD_FIELD_UNIVERSAL_IDENTIFIERS } from 'src/database/commands/upgrade-version-command/2-58/constants/index-level-unique-standard-field-universal-identifiers.constant';
import { type FlatApplicationCacheMaps } from 'src/engine/core-modules/application/types/flat-application-cache-maps.type';
import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { isMorphOrRelationFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-morph-or-relation-flat-field-metadata.util';
import { isPrimaryKeyFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-primary-key-flat-field-metadata.util';
import { type FlatIndexMetadata } from 'src/engine/metadata-modules/flat-index-metadata/types/flat-index-metadata.type';
import { isSystemUniqueFlatIndexMetadata } from 'src/engine/metadata-modules/flat-index-metadata/utils/is-system-unique-flat-index-metadata.util';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { generateDeterministicFlatIndexMetadataOrThrow } from 'src/engine/metadata-modules/index-metadata/utils/generate-deterministic-flat-index.util';
import { type UniversalFlatIndexMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-index-metadata.type';

const NON_DELETED_RECORDS_INDEX_WHERE_CLAUSE = '"deletedAt" IS NULL';

const INDEX_LEVEL_UNIQUE_STANDARD_FIELD_UNIVERSAL_IDENTIFIER_SET =
  new Set<string>(
    Object.values(INDEX_LEVEL_UNIQUE_STANDARD_FIELD_UNIVERSAL_IDENTIFIERS),
  );

export type UniqueFieldIndexReplacement = {
  legacyFlatIndexMetadata: FlatIndexMetadata;
  legacyApplicationUniversalIdentifier: string;
  replacementFlatIndexMetadata: UniversalFlatIndexMetadata;
  isReplacementAlreadyCreated: boolean;
  flatObjectMetadata: FlatObjectMetadata;
};

export const buildUniqueFieldIndexReplacements = ({
  flatObjectMetadataMaps,
  flatFieldMetadataMaps,
  flatIndexMaps,
  flatApplicationMaps,
  now,
}: Pick<
  AllFlatEntityMaps,
  'flatObjectMetadataMaps' | 'flatFieldMetadataMaps' | 'flatIndexMaps'
> & {
  flatApplicationMaps: FlatApplicationCacheMaps;
  now: string;
}): UniqueFieldIndexReplacement[] =>
  Object.values(flatIndexMaps.byUniversalIdentifier)
    .filter(isDefined)
    .flatMap((legacyFlatIndexMetadata) => {
      const [indexField, ...otherIndexFields] =
        legacyFlatIndexMetadata.flatIndexFieldMetadatas;

      if (
        !isSystemUniqueFlatIndexMetadata(legacyFlatIndexMetadata) ||
        isNonEmptyString(legacyFlatIndexMetadata.indexWhereClause) ||
        !isDefined(indexField) ||
        otherIndexFields.length > 0 ||
        isDefined(indexField.subFieldName)
      ) {
        return [];
      }

      const flatFieldMetadata = findFlatEntityByIdInFlatEntityMaps({
        flatEntityId: indexField.fieldMetadataId,
        flatEntityMaps: flatFieldMetadataMaps,
      });
      const flatObjectMetadata = findFlatEntityByIdInFlatEntityMaps({
        flatEntityId: legacyFlatIndexMetadata.objectMetadataId,
        flatEntityMaps: flatObjectMetadataMaps,
      });

      if (
        !isDefined(flatFieldMetadata) ||
        !isDefined(flatObjectMetadata) ||
        isMorphOrRelationFlatFieldMetadata(flatFieldMetadata) ||
        isPrimaryKeyFlatFieldMetadata(flatFieldMetadata) ||
        INDEX_LEVEL_UNIQUE_STANDARD_FIELD_UNIVERSAL_IDENTIFIER_SET.has(
          flatFieldMetadata.universalIdentifier,
        )
      ) {
        return [];
      }

      const legacyApplicationUniversalIdentifier =
        flatApplicationMaps.byId[legacyFlatIndexMetadata.applicationId]
          ?.universalIdentifier;
      const fieldApplicationUniversalIdentifier =
        flatApplicationMaps.byId[flatFieldMetadata.applicationId]
          ?.universalIdentifier;

      if (
        !isDefined(legacyApplicationUniversalIdentifier) ||
        !isDefined(fieldApplicationUniversalIdentifier)
      ) {
        return [];
      }

      const replacementFlatIndexMetadata =
        generateDeterministicFlatIndexMetadataOrThrow({
          flatObjectMetadata,
          objectFlatFieldMetadatas: [flatFieldMetadata],
          flatIndex: {
            createdAt: now,
            updatedAt: now,
            universalFlatIndexFieldMetadatas: [
              {
                createdAt: now,
                updatedAt: now,
                fieldMetadataUniversalIdentifier:
                  flatFieldMetadata.universalIdentifier,
                order: 0,
                subFieldName: null,
              },
            ],
            indexType: legacyFlatIndexMetadata.indexType,
            indexWhereClause: NON_DELETED_RECORDS_INDEX_WHERE_CLAUSE,
            isUnique: true,
            isSystemSideEffect: true,
            objectMetadataUniversalIdentifier:
              flatObjectMetadata.universalIdentifier,
            applicationUniversalIdentifier: fieldApplicationUniversalIdentifier,
          },
        });

      return [
        {
          legacyFlatIndexMetadata,
          legacyApplicationUniversalIdentifier,
          replacementFlatIndexMetadata,
          isReplacementAlreadyCreated: isDefined(
            flatIndexMaps.byUniversalIdentifier[
              replacementFlatIndexMetadata.universalIdentifier
            ],
          ),
          flatObjectMetadata,
        },
      ];
    });
