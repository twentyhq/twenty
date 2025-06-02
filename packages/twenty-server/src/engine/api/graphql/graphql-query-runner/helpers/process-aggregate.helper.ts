import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';
import { SelectQueryBuilder } from 'typeorm';

import { AggregateOperations } from 'src/engine/api/graphql/graphql-query-runner/constants/aggregate-operations.constant';
import { AggregationField } from 'src/engine/api/graphql/workspace-schema-builder/utils/get-available-aggregations-from-object-fields.util';
import { formatColumnNamesFromCompositeFieldAndSubfields } from 'src/engine/twenty-orm/utils/format-column-names-from-composite-field-and-subfield.util';

@Injectable()
export class ProcessAggregateHelper {
  public addSelectedAggregatedFieldsQueriesToQueryBuilder = ({
    selectedAggregatedFields,
    queryBuilder,
  }: {
    selectedAggregatedFields: Record<string, AggregationField>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
        !Object.values(AggregateOperations).includes(
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
        case AggregateOperations.COUNT_EMPTY:
          queryBuilder.addSelect(
            `CASE WHEN COUNT(*) = 0 THEN NULL ELSE COUNT(*) - COUNT(${columnExpression}) END`,
            `${aggregatedFieldName}`,
          );
          break;
        case AggregateOperations.COUNT_NOT_EMPTY:
          queryBuilder.addSelect(
            `CASE WHEN COUNT(*) = 0 THEN NULL ELSE COUNT(${columnExpression}) END`,
            `${aggregatedFieldName}`,
          );
          break;
        case AggregateOperations.COUNT_UNIQUE_VALUES:
          queryBuilder.addSelect(
            `CASE WHEN COUNT(*) = 0 THEN NULL ELSE COUNT(DISTINCT ${columnExpression}) END`,
            `${aggregatedFieldName}`,
          );
          break;
        case AggregateOperations.PERCENTAGE_EMPTY:
          queryBuilder.addSelect(
            `CASE WHEN COUNT(*) = 0 THEN NULL ELSE CAST(((COUNT(*) - COUNT(${columnExpression})::decimal) / COUNT(*)) AS DECIMAL) END`,
            `${aggregatedFieldName}`,
          );
          break;
        case AggregateOperations.PERCENTAGE_NOT_EMPTY:
          queryBuilder.addSelect(
            `CASE WHEN COUNT(*) = 0 THEN NULL ELSE CAST((COUNT(${columnExpression})::decimal / COUNT(*)) AS DECIMAL) END`,
            `${aggregatedFieldName}`,
          );
          break;
        case AggregateOperations.COUNT_TRUE:
          queryBuilder.addSelect(
            `CASE WHEN COUNT(*) = 0 THEN NULL ELSE COUNT(CASE WHEN ${columnExpression}::boolean = TRUE THEN 1 ELSE NULL END) END`,
            `${aggregatedFieldName}`,
          );
          break;

        case AggregateOperations.COUNT_FALSE:
          queryBuilder.addSelect(
            `CASE WHEN COUNT(*) = 0 THEN NULL ELSE COUNT(CASE WHEN ${columnExpression}::boolean = FALSE THEN 1 ELSE NULL END) END`,
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
