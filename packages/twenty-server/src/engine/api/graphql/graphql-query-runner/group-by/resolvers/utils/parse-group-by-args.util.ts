import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type GroupByResolverArgs } from 'src/engine/api/graphql/workspace-resolver-builder/interfaces/workspace-resolvers-builder.interface';

import { type GroupByField } from 'src/engine/api/graphql/graphql-query-runner/group-by/resolvers/types/group-by-field.types';
import { isGroupByDateFieldDefinition } from 'src/engine/api/graphql/graphql-query-runner/group-by/resolvers/utils/is-group-by-date-field-definition.util';
import { parseGroupByRelationField } from 'src/engine/api/graphql/graphql-query-runner/group-by/resolvers/utils/parse-group-by-relation-field.util';
import { validateSingleKeyForGroupByOrThrow } from 'src/engine/api/graphql/graphql-query-runner/group-by/resolvers/utils/validate-single-key-for-group-by-or-throw.util';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { buildFieldMapsFromFlatObjectMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/build-field-maps-from-flat-object-metadata.util';
import { isMorphOrRelationFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-morph-or-relation-flat-field-metadata.util';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';

export const parseGroupByArgs = (
  args: GroupByResolverArgs,
  flatObjectMetadata: FlatObjectMetadata,
  flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>,
  flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>,
): GroupByField[] => {
  const groupByFieldNames = args.groupBy;

  const groupByFields: GroupByField[] = [];

  const { fieldIdByName, fieldIdByJoinColumnName } =
    buildFieldMapsFromFlatObjectMetadata(
      flatFieldMetadataMaps,
      flatObjectMetadata,
    );

  for (const fieldNames of groupByFieldNames) {
    validateSingleKeyForGroupByOrThrow({
      groupByKeys: Object.keys(fieldNames),
      errorMessage:
        'You cannot provide multiple fields in one GroupByInput, split them into multiple GroupByInput',
    });

    for (const fieldName of Object.keys(fieldNames)) {
      const fieldMetadataId =
        fieldIdByName[fieldName] || fieldIdByJoinColumnName[fieldName];
      const fieldMetadata = fieldMetadataId
        ? flatFieldMetadataMaps.byId[fieldMetadataId]
        : undefined;

      if (!isDefined(fieldMetadata) || !isDefined(fieldMetadataId)) {
        throw new Error(`Unidentified field in groupBy: ${fieldName}`);
      }

      const isGroupByRelationField =
        isMorphOrRelationFlatFieldMetadata(fieldMetadata) &&
        typeof fieldNames[fieldName] === 'object' &&
        fieldNames[fieldName] !== null &&
        !isGroupByDateFieldDefinition(fieldNames[fieldName]);

      // Handle relation fields
      if (isGroupByRelationField) {
        parseGroupByRelationField({
          fieldNames,
          fieldName,
          fieldMetadata,
          flatObjectMetadataMaps,
          flatFieldMetadataMaps,
          groupByFields,
        });

        continue;
      }

      // Handle date fields
      if (
        fieldMetadata.type === FieldMetadataType.DATE ||
        fieldMetadata.type === FieldMetadataType.DATE_TIME
      ) {
        const fieldGroupByDefinition = fieldNames[fieldName];

        const shouldGroupByDateGranularity = isGroupByDateFieldDefinition(
          fieldGroupByDefinition,
        );

        if (shouldGroupByDateGranularity) {
          groupByFields.push({
            fieldMetadata,
            dateGranularity: fieldGroupByDefinition.granularity,
            weekStartDay: fieldGroupByDefinition.weekStartDay,
            timeZone: fieldGroupByDefinition.timeZone,
          });
          continue;
        }
      }

      // Handle regular fields and composite fields
      if (fieldNames[fieldName] === true) {
        groupByFields.push({
          fieldMetadata,
          subFieldName: undefined,
        });
        continue;
      } else if (typeof fieldNames[fieldName] === 'object') {
        validateSingleKeyForGroupByOrThrow({
          groupByKeys: Object.keys(fieldNames[fieldName]),
          errorMessage:
            'You cannot provide multiple subfields in one GroupByInput, split them into multiple GroupByInput',
        });

        for (const subFieldName of Object.keys(fieldNames[fieldName])) {
          if (
            (fieldNames[fieldName] as Record<string, boolean>)[subFieldName] ===
            true
          ) {
            groupByFields.push({
              fieldMetadata,
              subFieldName,
            });
            continue;
          }
        }
      }
    }
  }

  return groupByFields;
};
