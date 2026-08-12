import { AggregateOperations } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type AggregationField } from 'src/engine/api/graphql/workspace-schema-builder/utils/get-available-aggregations-from-object-fields.util';
import { formatColumnNamesFromCompositeFieldAndSubfields } from 'src/engine/twenty-orm/utils/format-column-names-from-composite-field-and-subfield.util';
import { type RecordQueryBuilder } from 'src/engine/api/graphql/graphql-query-runner/types/record-query-builder.type';

export class ProcessAggregateHelper {
  public static addSelectedAggregatedFieldsQueriesToQueryBuilder = ({
    selectedAggregatedFields,
    queryBuilder,
    objectMetadataNameSingular,
  }: {
    selectedAggregatedFields: Record<string, AggregationField>;
    // oxlint-disable-next-line typescript/no-explicit-any
    queryBuilder: RecordQueryBuilder;
    objectMetadataNameSingular: string;
  }) => {
    queryBuilder.select([]);

    for (const [aggregatedFieldName, aggregatedField] of Object.entries(
      selectedAggregatedFields,
    )) {
      const aggregateExpression = this.getAggregateExpression(
        aggregatedField,
        objectMetadataNameSingular,
      );

      if (!isDefined(aggregateExpression)) {
        continue;
      }

      queryBuilder.addSelect(aggregateExpression, aggregatedFieldName);
    }
  };

  public static getAggregateExpression = (
    aggregatedField: AggregationField,
    objectMetadataNameSingular: string,
  ): string | undefined => {
    if (
      !isDefined(aggregatedField?.fromField) ||
      !isDefined(aggregatedField?.aggregateOperation)
    ) {
      return;
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
      return;
    }

    const concatenatedColumns = columnNames
      .map((col) => `"${objectMetadataNameSingular}"."${col}"`)
      .join(',');

    const columnExpression = `NULLIF(CONCAT(${concatenatedColumns}), '')`;

    switch (aggregatedField.aggregateOperation) {
      case AggregateOperations.COUNT_EMPTY:
        return `CASE WHEN COUNT(*) = 0 THEN NULL ELSE COUNT(*) - COUNT(${columnExpression}) END`;
      case AggregateOperations.COUNT_NOT_EMPTY:
        return `CASE WHEN COUNT(*) = 0 THEN NULL ELSE COUNT(${columnExpression}) END`;
      case AggregateOperations.COUNT_UNIQUE_VALUES:
        return `CASE WHEN COUNT(*) = 0 THEN NULL ELSE COUNT(DISTINCT ${columnExpression}) END`;
      case AggregateOperations.PERCENTAGE_EMPTY:
        return `CASE WHEN COUNT(*) = 0 THEN NULL ELSE CAST(((COUNT(*) - COUNT(${columnExpression})::decimal) / COUNT(*)) AS DECIMAL) END`;
      case AggregateOperations.PERCENTAGE_NOT_EMPTY:
        return `CASE WHEN COUNT(*) = 0 THEN NULL ELSE CAST((COUNT(${columnExpression})::decimal / COUNT(*)) AS DECIMAL) END`;
      case AggregateOperations.COUNT_TRUE:
        return `CASE WHEN COUNT(*) = 0 THEN NULL ELSE COUNT(CASE WHEN ${columnExpression}::boolean = TRUE THEN 1 ELSE NULL END) END`;

      case AggregateOperations.COUNT_FALSE:
        return `CASE WHEN COUNT(*) = 0 THEN NULL ELSE COUNT(CASE WHEN ${columnExpression}::boolean = FALSE THEN 1 ELSE NULL END) END`;
      default: {
        return `${aggregatedField.aggregateOperation}("${objectMetadataNameSingular}"."${columnNameForNumericOperation}")`;
      }
    }
  };
}
