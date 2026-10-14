import { AggregateOperations, FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { addRelationJoinAliasToQueryBuilder } from 'src/engine/api/graphql/graphql-query-runner/graphql-query-parsers/utils/add-relation-join-alias.util';
import { assertFieldIsReadableOrThrow } from 'src/engine/api/graphql/graphql-query-runner/graphql-query-parsers/utils/assert-field-is-readable-or-throw.util';
import {
  type AggregationField,
  type AggregationFieldThroughRelation,
} from 'src/engine/api/graphql/workspace-schema-builder/utils/get-available-aggregations-from-object-fields.util';
import { formatColumnNamesFromCompositeFieldAndSubfields } from 'src/engine/twenty-orm/utils/format-column-names-from-composite-field-and-subfield.util';
import { type WorkspaceSelectQueryBuilder } from 'src/engine/twenty-orm/query-builder/workspace-select-query-builder';

export class ProcessAggregateHelper {
  public static addSelectedAggregatedFieldsQueriesToQueryBuilder = ({
    selectedAggregatedFields,
    queryBuilder,
    objectMetadataNameSingular,
  }: {
    selectedAggregatedFields: Record<string, AggregationField>;
    // oxlint-disable-next-line typescript/no-explicit-any
    queryBuilder: WorkspaceSelectQueryBuilder;
    objectMetadataNameSingular: string;
  }) => {
    queryBuilder.select([]);

    for (const [aggregatedFieldName, aggregatedField] of Object.entries(
      selectedAggregatedFields,
    )) {
      const tableAlias = isDefined(aggregatedField?.throughRelation)
        ? this.joinThroughRelation({
            queryBuilder,
            rootAlias: objectMetadataNameSingular,
            throughRelation: aggregatedField.throughRelation,
          })
        : objectMetadataNameSingular;

      const aggregateExpression = this.getAggregateExpression(
        aggregatedField,
        tableAlias,
      );

      if (!isDefined(aggregateExpression)) {
        continue;
      }

      queryBuilder.addSelect(aggregateExpression, aggregatedFieldName);
    }
  };

  // Same join and read checks as filtering or ordering through the relation; returns the alias the expression must read from
  private static joinThroughRelation = ({
    queryBuilder,
    rootAlias,
    throughRelation,
  }: {
    queryBuilder: WorkspaceSelectQueryBuilder;
    rootAlias: string;
    throughRelation: AggregationFieldThroughRelation;
  }): string => {
    assertFieldIsReadableOrThrow({
      objectsPermissions: queryBuilder.objectRecordsPermissions,
      objectMetadataId: throughRelation.relationFieldMetadata.objectMetadataId,
      fieldMetadataId: throughRelation.relationFieldMetadata.id,
    });

    assertFieldIsReadableOrThrow({
      objectsPermissions: queryBuilder.objectRecordsPermissions,
      objectMetadataId: throughRelation.targetObjectMetadata.id,
      fieldMetadataId: throughRelation.targetFieldMetadata.id,
    });

    addRelationJoinAliasToQueryBuilder({
      queryBuilder,
      parentAlias: rootAlias,
      relationName: throughRelation.relationFieldName,
    });

    return throughRelation.relationFieldName;
  };

  public static getAggregateExpression = (
    aggregatedField: AggregationField,
    tableAlias: string,
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
      .map((col) => `"${tableAlias}"."${col}"`)
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
        const numericColumn = `"${tableAlias}"."${columnNameForNumericOperation}"`;

        const numericExpression =
          aggregatedField.fromFieldType === FieldMetadataType.RATING
            ? `CAST(SPLIT_PART(${numericColumn}::text, '_', 2) AS INTEGER)`
            : numericColumn;

        return `${aggregatedField.aggregateOperation}(${numericExpression})`;
      }
    }
  };
}
