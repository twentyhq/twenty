import { isDefined } from 'twenty-shared/utils';

import { type GroupByDefinition } from 'src/engine/api/common/common-query-runners/types/group-by-definition.type';

// Builds the WHERE that scopes the per-group record subquery to the resolved groups,
// shared by the v1 and v2 with-records services so the two ORM paths cannot diverge.
export const buildGroupByRecordConditions = ({
  groupsResult,
  groupByDefinitions,
}: {
  groupsResult: Array<Record<string, unknown>>;
  groupByDefinitions: GroupByDefinition[];
}): { sql: string; parameters: Record<string, unknown> } => {
  const parameters: Record<string, unknown> = {};

  const groupConditions = groupsResult.map((group, groupIndex) => {
    const conditions = groupByDefinitions
      .map((groupByDefinition, definitionIndex) => {
        const parameterValue = group[groupByDefinition.alias];

        if (!isDefined(parameterValue)) {
          return `${groupByDefinition.expression} IS NULL`;
        }

        const parameterName = `groupValue_${groupIndex}_${definitionIndex}`;

        parameters[parameterName] = parameterValue;

        return `${groupByDefinition.expression} = :${parameterName}`;
      })
      .join(' AND ');

    return `(${conditions})`;
  });

  return { sql: `(${groupConditions.join(' OR ')})`, parameters };
};
