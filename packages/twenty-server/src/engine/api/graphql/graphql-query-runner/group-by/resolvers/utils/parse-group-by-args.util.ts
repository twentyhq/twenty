import { isDefined } from 'class-validator';
import { FieldMetadataType } from 'twenty-shared/types';

import { type GroupByResolverArgs } from 'src/engine/api/graphql/workspace-resolver-builder/interfaces/workspace-resolvers-builder.interface';

import { type GroupByField } from 'src/engine/api/graphql/graphql-query-runner/group-by/resolvers/types/group-by-field.types';
import { isGroupByDateFieldDefinition } from 'src/engine/api/graphql/graphql-query-runner/group-by/resolvers/utils/is-group-by-date-field-definition.util';
import { parseGroupByRelationField } from 'src/engine/api/graphql/graphql-query-runner/group-by/resolvers/utils/parse-group-by-relation-field.util';
import { validateSingleKeyForGroupByOrThrow } from 'src/engine/api/graphql/graphql-query-runner/group-by/resolvers/utils/validate-single-key-for-group-by-or-throw.util';
import { isFieldMetadataRelationOrMorphRelation } from 'src/engine/api/graphql/workspace-schema-builder/utils/is-field-metadata-relation-or-morph-relation.utils';
import { type ObjectMetadataItemWithFieldMaps } from 'src/engine/metadata-modules/types/object-metadata-item-with-field-maps';
import { type ObjectMetadataMaps } from 'src/engine/metadata-modules/types/object-metadata-maps';

export const parseGroupByArgs = (
  args: GroupByResolverArgs,
  objectMetadataItemWithFieldMaps: ObjectMetadataItemWithFieldMaps,
  objectMetadataMaps: ObjectMetadataMaps,
): GroupByField[] => {
  const groupByFieldNames = args.groupBy;

  const groupByFields: GroupByField[] = [];

  for (const fieldNames of groupByFieldNames) {
    validateSingleKeyForGroupByOrThrow({
      groupByKeys: Object.keys(fieldNames),
      errorMessage:
        'You cannot provide multiple fields in one GroupByInput, split them into multiple GroupByInput',
    });

    for (const fieldName of Object.keys(fieldNames)) {
      const fieldMetadataId =
        objectMetadataItemWithFieldMaps.fieldIdByName[fieldName] ||
        objectMetadataItemWithFieldMaps.fieldIdByJoinColumnName[fieldName];
      const fieldMetadata =
        objectMetadataItemWithFieldMaps.fieldsById[fieldMetadataId];

      if (!isDefined(fieldMetadata) || !isDefined(fieldMetadataId)) {
        throw new Error(`Unidentified field in groupBy: ${fieldName}`);
      }

      const isGroupByRelationField =
        isFieldMetadataRelationOrMorphRelation(fieldMetadata) &&
        typeof fieldNames[fieldName] === 'object' &&
        fieldNames[fieldName] !== null &&
        !isGroupByDateFieldDefinition(fieldNames[fieldName]);

      // Handle relation fields
      if (isGroupByRelationField) {
        parseGroupByRelationField({
          fieldNames,
          fieldName,
          fieldMetadata,
          objectMetadataMaps,
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
