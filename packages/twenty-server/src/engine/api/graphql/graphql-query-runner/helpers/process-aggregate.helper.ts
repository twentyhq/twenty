import { SelectQueryBuilder } from 'typeorm';

import { AggregationField } from 'src/engine/api/graphql/workspace-schema-builder/utils/get-available-aggregations-from-object-fields.util';
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
        !isDefined(aggregatedField?.aggregationOperation)
      ) {
        continue;
      }

      const columnName = formatColumnNameFromCompositeFieldAndSubfield(
        aggregatedField.fromField,
        aggregatedField.fromSubField,
      );
      const operation = aggregatedField.aggregationOperation;

      queryBuilder.addSelect(
        `${operation}("${columnName}")`,
        `${aggregatedFieldName}`,
      );
    }
  };
}
