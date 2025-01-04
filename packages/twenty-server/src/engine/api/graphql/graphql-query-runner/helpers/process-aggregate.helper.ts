import { SelectQueryBuilder } from 'typeorm';

import { AGGREGATE_OPERATIONS } from 'src/engine/api/graphql/graphql-query-runner/constants/aggregate-operations.constant';
import { AggregationField } from 'src/engine/api/graphql/workspace-schema-builder/utils/get-available-aggregations-from-object-fields.util';
import { FIELD_METADATA_TYPES_TO_TEXT_COLUMN_TYPE } from 'src/engine/metadata-modules/workspace-migration/constants/fieldMetadataTypesToTextColumnType';
import { formatColumnNameFromCompositeFieldAndSubfield } from 'src/engine/twenty-orm/utils/format-column-name-from-composite-field-and-subfield.util';
import { isDefined } from 'src/utils/is-defined';

export class ProcessAggregateHelper {
  public addSelectedAggregatedFieldsQueriesToQueryBuilder = ({
    selectedAggregatedFields,
    queryBuilder,
  }: {
    selectedAggregatedFields: Record<string, AggregationField>;
    queryBuilder: SelectQueryBuilder<any>;
  }) => {
    queryBuilder.select([]);

    for (const [aggregatedFieldName, aggregatedField] of Object.entries(
      selectedAggregatedFields,
    )) {
      if (
        !isDefined(aggregatedField?.fromField) ||
        !isDefined(aggregatedField?.aggregateOperation)
      ) {
        continue;
      }

      const columnName = formatColumnNameFromCompositeFieldAndSubfield(
        aggregatedField.fromField,
        aggregatedField.fromSubField,
      );

      if (
        !Object.values(AGGREGATE_OPERATIONS).includes(
          aggregatedField.aggregateOperation,
        )
      ) {
        continue;
      }

      const columnEmptyValueExpression =
        FIELD_METADATA_TYPES_TO_TEXT_COLUMN_TYPE.includes(
          aggregatedField.fromFieldType,
        )
          ? `NULLIF("${columnName}", '')`
          : `"${columnName}"`;

      switch (aggregatedField.aggregateOperation) {
        case AGGREGATE_OPERATIONS.countEmpty:
          queryBuilder.addSelect(
            `CASE WHEN COUNT(*) = 0 THEN NULL ELSE COUNT(*) - COUNT(${columnEmptyValueExpression}) END`,
            `${aggregatedFieldName}`,
          );
          break;
        case AGGREGATE_OPERATIONS.countNotEmpty:
          queryBuilder.addSelect(
            `CASE WHEN COUNT(*) = 0 THEN NULL ELSE COUNT(${columnEmptyValueExpression}) END`,
            `${aggregatedFieldName}`,
          );
          break;
        case AGGREGATE_OPERATIONS.countUniqueValues:
          queryBuilder.addSelect(
            `CASE WHEN COUNT(*) = 0 THEN NULL ELSE COUNT(DISTINCT "${columnName}") END`,
            `${aggregatedFieldName}`,
          );
          break;
        case AGGREGATE_OPERATIONS.percentageEmpty:
          queryBuilder.addSelect(
            `CASE WHEN COUNT(*) = 0 THEN NULL ELSE CAST(((COUNT(*) - COUNT(${columnEmptyValueExpression})::decimal) / COUNT(*)) AS DECIMAL) END`,
            `${aggregatedFieldName}`,
          );
          break;
        case AGGREGATE_OPERATIONS.percentageNotEmpty:
          queryBuilder.addSelect(
            `CASE WHEN COUNT(*) = 0 THEN NULL ELSE CAST((COUNT(${columnEmptyValueExpression})::decimal / COUNT(*)) AS DECIMAL) END`,
            `${aggregatedFieldName}`,
          );
          break;
        default:
          queryBuilder.addSelect(
            `${aggregatedField.aggregateOperation}("${columnName}")`,
            `${aggregatedFieldName}`,
          );
      }
    }
  };
}
