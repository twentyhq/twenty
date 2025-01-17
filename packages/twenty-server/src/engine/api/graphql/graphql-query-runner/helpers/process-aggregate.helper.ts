import { SelectQueryBuilder } from 'typeorm';

import { AGGREGATE_OPERATIONS } from 'src/engine/api/graphql/graphql-query-runner/constants/aggregate-operations.constant';
import { AggregationField } from 'src/engine/api/graphql/workspace-schema-builder/utils/get-available-aggregations-from-object-fields.util';
import { formatColumnNamesFromCompositeFieldAndSubfields } from 'src/engine/twenty-orm/utils/format-column-names-from-composite-field-and-subfield.util';
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

      const columnNames = formatColumnNamesFromCompositeFieldAndSubfields(
        aggregatedField.fromField,
        aggregatedField.fromSubFields,
      );

      const columnNameForNumericOperation = isDefined(
        aggregatedField.subFieldForNumericOperation,
      )
        ? formatColumnNamesFromCompositeFieldAndSubfields(
            aggregatedField.fromField,
            [aggregatedField.subFieldForNumericOperation],
          )[0]
        : columnNames[0];

      if (
        !Object.values(AGGREGATE_OPERATIONS).includes(
          aggregatedField.aggregateOperation,
        )
      ) {
        continue;
      }

      const concatenatedColumns = columnNames
        .map((col) => `"${col}"`)
        .join(',');

      const columnExpression = `NULLIF(CONCAT(${concatenatedColumns}), '')`;

      switch (aggregatedField.aggregateOperation) {
        case AGGREGATE_OPERATIONS.countEmpty:
          queryBuilder.addSelect(
            `CASE WHEN COUNT(*) = 0 THEN NULL ELSE COUNT(*) - COUNT(${columnExpression}) END`,
            `${aggregatedFieldName}`,
          );
          break;
        case AGGREGATE_OPERATIONS.countNotEmpty:
          queryBuilder.addSelect(
            `CASE WHEN COUNT(*) = 0 THEN NULL ELSE COUNT(${columnExpression}) END`,
            `${aggregatedFieldName}`,
          );
          break;
        case AGGREGATE_OPERATIONS.countUniqueValues:
          queryBuilder.addSelect(
            `CASE WHEN COUNT(*) = 0 THEN NULL ELSE COUNT(DISTINCT ${columnExpression}) END`,
            `${aggregatedFieldName}`,
          );
          break;
        case AGGREGATE_OPERATIONS.percentageEmpty:
          queryBuilder.addSelect(
            `CASE WHEN COUNT(*) = 0 THEN NULL ELSE CAST(((COUNT(*) - COUNT(${columnExpression})::decimal) / COUNT(*)) AS DECIMAL) END`,
            `${aggregatedFieldName}`,
          );
          break;
        case AGGREGATE_OPERATIONS.percentageNotEmpty:
          queryBuilder.addSelect(
            `CASE WHEN COUNT(*) = 0 THEN NULL ELSE CAST((COUNT(${columnExpression})::decimal / COUNT(*)) AS DECIMAL) END`,
            `${aggregatedFieldName}`,
          );
          break;
        default: {
          queryBuilder.addSelect(
            `${aggregatedField.aggregateOperation}("${columnNameForNumericOperation}")`,
            `${aggregatedFieldName}`,
          );
        }
      }
    }
  };
}
