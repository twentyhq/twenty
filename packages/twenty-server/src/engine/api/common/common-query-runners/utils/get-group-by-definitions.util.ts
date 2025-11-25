import { type GroupByDefinition } from 'src/engine/api/graphql/graphql-query-runner/group-by/resolvers/types/group-by-definition.type';
import { type GroupByField } from 'src/engine/api/graphql/graphql-query-runner/group-by/resolvers/types/group-by-field.types';
import { getGroupByExpression } from 'src/engine/api/graphql/graphql-query-runner/group-by/resolvers/utils/get-group-by-expression.util';
import { isGroupByDateField } from 'src/engine/api/graphql/graphql-query-runner/group-by/resolvers/utils/is-group-by-date-field.util';
import { isGroupByRelationField } from 'src/engine/api/graphql/graphql-query-runner/group-by/resolvers/utils/is-group-by-relation-field.util';
import { formatColumnNameAsAlias } from 'src/engine/api/graphql/graphql-query-runner/group-by/resolvers/utils/remove-quote.util';
import { formatColumnNamesFromCompositeFieldAndSubfields } from 'src/engine/twenty-orm/utils/format-column-names-from-composite-field-and-subfield.util';

export const getGroupByDefinitions = ({
  groupByFields,
  objectMetadataNameSingular,
}: {
  groupByFields: GroupByField[];
  objectMetadataNameSingular: string;
}): GroupByDefinition[] => {
  return groupByFields.map((groupByField) => {
    let columnName: string;
    let columnNameWithQuotes: string;

    if (isGroupByRelationField(groupByField)) {
      const joinAlias = groupByField.fieldMetadata.name;
      const nestedColumnName = formatColumnNamesFromCompositeFieldAndSubfields(
        groupByField.nestedFieldMetadata.name,
        groupByField.nestedSubFieldName
          ? [groupByField.nestedSubFieldName]
          : undefined,
      )[0];

      columnNameWithQuotes = `"${joinAlias}"."${nestedColumnName}"`;
    } else {
      columnName = formatColumnNamesFromCompositeFieldAndSubfields(
        groupByField.fieldMetadata.name,
        groupByField.subFieldName ? [groupByField.subFieldName] : undefined,
      )[0];
      columnNameWithQuotes = `"${objectMetadataNameSingular}"."${columnName}"`;
    }

    const isGroupByDateFieldOrTargetField =
      isGroupByDateField(groupByField) ||
      (isGroupByRelationField(groupByField) && groupByField.dateGranularity);

    const alias =
      formatColumnNameAsAlias(columnNameWithQuotes) +
      (isGroupByDateFieldOrTargetField
        ? `_${groupByField.dateGranularity}`
        : '');

    return {
      columnNameWithQuotes,
      expression: getGroupByExpression({
        groupByField,
        columnNameWithQuotes,
      }),
      alias,
      dateGranularity: isGroupByDateFieldOrTargetField
        ? groupByField.dateGranularity
        : undefined,
    };
  });
};
