import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

import { INDEX_LEVEL_UNIQUE_STANDARD_FIELD_UNIVERSAL_IDENTIFIERS } from 'src/database/commands/upgrade-version-command/2-58/constants/index-level-unique-standard-field-universal-identifiers.constant';
import { type UniqueFieldIndexReplacement } from 'src/database/commands/upgrade-version-command/2-58/types/unique-field-index-replacement.type';
import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { isMorphOrRelationFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-morph-or-relation-flat-field-metadata.util';
import { isPrimaryKeyFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-primary-key-flat-field-metadata.util';
import { isSystemUniqueFlatIndexMetadata } from 'src/engine/metadata-modules/flat-index-metadata/utils/is-system-unique-flat-index-metadata.util';
import { NON_DELETED_RECORDS_INDEX_WHERE_CLAUSE } from 'src/engine/metadata-modules/index-metadata/constants/non-deleted-records-index-where-clause.constant';
import { generateDeterministicFlatIndexMetadataOrThrow } from 'src/engine/metadata-modules/index-metadata/utils/generate-deterministic-flat-index.util';

const INDEX_LEVEL_UNIQUE_STANDARD_FIELD_UNIVERSAL_IDENTIFIER_SET =
  new Set<string>(
    Object.values(INDEX_LEVEL_UNIQUE_STANDARD_FIELD_UNIVERSAL_IDENTIFIERS),
  );

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
  flatApplicationMaps: {
    byId: Partial<Record<string, Pick<FlatApplication, 'universalIdentifier'>>>;
  };
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
