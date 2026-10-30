import { isDefined } from 'twenty-shared/utils';

import { type GroupByDefinition } from 'src/engine/api/common/common-query-runners/types/group-by-definition.type';

// Builds the WHERE that scopes the per-group record subquery to the resolved groups
export const buildGroupByRecordConditions = ({
  groupsResult,
  groupByDefinitions,
}: {
  groupsResult: Array<Record<string, unknown>>;
  groupByDefinitions: GroupByDefinition[];
}): { sql: string; parameters: Record<string, unknown> } => {
  if (groupsResult.length === 0) {
    return { sql: 'FALSE', parameters: {} };
  }

  if (groupByDefinitions.length === 1) {
    return buildSingleDimensionConditions({
      groupsResult,
      groupByDefinition: groupByDefinitions[0],
    });
  }

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

// A hashed IN list stays flat in cost where an OR chain of equalities is linear in the group count
const buildSingleDimensionConditions = ({
  groupsResult,
  groupByDefinition,
}: {
  groupsResult: Array<Record<string, unknown>>;
  groupByDefinition: GroupByDefinition;
}): { sql: string; parameters: Record<string, unknown> } => {
  const groupValues = groupsResult
    .map((group) => group[groupByDefinition.alias])
    .filter(isDefined);

  const hasNullGroup = groupValues.length < groupsResult.length;

  const conditions: string[] = [];

  if (groupValues.length > 0) {
    conditions.push(`${groupByDefinition.expression} IN (:...groupValues)`);
  }

  if (hasNullGroup) {
    conditions.push(`${groupByDefinition.expression} IS NULL`);
  }

  return {
    sql: `(${conditions.join(' OR ')})`,
    parameters: groupValues.length > 0 ? { groupValues } : {},
  };
};
