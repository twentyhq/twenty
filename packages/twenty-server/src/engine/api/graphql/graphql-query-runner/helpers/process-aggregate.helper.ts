import { SelectQueryBuilder } from 'typeorm';

import { FieldMetadataInterface } from 'src/engine/metadata-modules/field-metadata/interfaces/field-metadata.interface';

import { AggregationField } from 'src/engine/api/graphql/workspace-schema-builder/utils/get-available-aggregations-from-object-fields.util';

export class ProcessAggregateHelper {
  public addSelectedAggregatedFieldsQueriesToQueryBuilder = ({
    fieldMetadataMapByName,
    selectedAggregatedFields,
    queryBuilder,
  }: {
    fieldMetadataMapByName: Record<string, FieldMetadataInterface>;
    selectedAggregatedFields: Record<string, AggregationField>;
    queryBuilder: SelectQueryBuilder<any>;
  }) => {
    queryBuilder.select([]);

    for (const [aggregatedFieldName, aggregatedField] of Object.entries(
      selectedAggregatedFields,
    )) {
      const fieldMetadata = fieldMetadataMapByName[aggregatedField.fromField];

      if (!fieldMetadata) {
        continue;
      }

      const fieldName = fieldMetadata.name;
      const operation = aggregatedField.aggregationOperation;

      queryBuilder.addSelect(
        `${operation}("${fieldName}")`,
        `${aggregatedFieldName}`,
      );
    }
  };
}
