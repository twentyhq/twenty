import { isDefined } from 'twenty-shared/utils';

import { AggregateOperations } from 'src/engine/api/graphql/graphql-query-runner/constants/aggregate-operations.constant';
import { type AggregationField } from 'src/engine/api/graphql/workspace-schema-builder/utils/get-available-aggregations-from-object-fields.util';
import { type WorkspaceSelectQueryBuilder } from 'src/engine/twenty-orm/repository/workspace-select-query-builder';
import { formatColumnNamesFromCompositeFieldAndSubfields } from 'src/engine/twenty-orm/utils/format-column-names-from-composite-field-and-subfield.util';

export class ProcessAggregateHelper {
  public static addSelectedAggregatedFieldsQueriesToQueryBuilder = ({
    selectedAggregatedFields,
    queryBuilder,
    objectMetadataNameSingular,
  }: {
    selectedAggregatedFields: Record<string, AggregationField>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    queryBuilder: WorkspaceSelectQueryBuilder<any>;
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

  public static extractColumnNamesFromAggregateExpression = (
    selection: string,
  ): string[] | null => {
    // Match content between CONCAT(" and ") - handle multiple columns
    const concatMatches = selection.match(
      /CONCAT\("([^"]+)"(?:,"([^"]+)")*\)/g,
    );

    if (concatMatches) {
      // Extract all column names between quotes after CONCAT
      const columnNames = selection.match(/"([^"]+)"/g)?.map((match) => {
        const fullColumn = match.slice(1, -1);
        // If there's a dot, extract only the column name (part after the dot)
        const parts = fullColumn.split('.');

        return parts[parts.length - 1];
      });

      return columnNames || null;
    }

    // For non-CONCAT expressions, match table.column pattern within quotes
    // Look for patterns like "table"."column" and extract only the column part
    const tableColumnMatches = selection.match(/"[^"]+"\."([^"]+)"/g);

    if (tableColumnMatches) {
      const columnNames = tableColumnMatches
        .map((match) => {
          // Extract the column name from "table"."column" pattern
          const columnMatch = match.match(/"[^"]+"\."([^"]+)"/);

          return columnMatch ? columnMatch[1] : null;
        })
        .filter(Boolean);

      return columnNames.length > 0
        ? columnNames.filter((c) => isDefined(c))
        : null;
    }

    // Fallback: match single quoted content that doesn't contain dots
    const singleColumnMatch = selection.match(/"([^".]+)"/);

    if (singleColumnMatch) {
      return [singleColumnMatch[1]];
    }

    return null;
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
