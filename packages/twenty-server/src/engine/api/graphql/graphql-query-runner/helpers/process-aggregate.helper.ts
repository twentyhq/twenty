import { SelectQueryBuilder } from 'typeorm';

import { AggregationField } from 'src/engine/api/graphql/workspace-schema-builder/utils/get-available-aggregations-from-object-fields.util';

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
        !aggregatedField?.fromColumnName ||
        !aggregatedField?.aggregationOperation
      ) {
        continue;
      }

      const columnName = aggregatedField.fromColumnName;
      const operation = aggregatedField.aggregationOperation;

      queryBuilder.addSelect(
        `${operation}("${columnName}")`,
        `${aggregatedFieldName}`,
      );
    }
  };
}
