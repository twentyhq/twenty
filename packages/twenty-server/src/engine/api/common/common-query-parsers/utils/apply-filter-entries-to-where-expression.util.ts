import { Brackets, NotBrackets, type WhereExpressionBuilder } from 'typeorm';

import { type CommonQueryFilterFieldParser } from 'src/engine/api/common/common-query-parsers/common-query-filter/common-query-filter-field.parser';
import { type WorkspaceSelectQueryBuilder } from 'src/engine/twenty-orm/query-builder/workspace-select-query-builder';

type FilterWalkContext = {
  outerQueryBuilder: WorkspaceSelectQueryBuilder;
  objectNameSingular: string;
  fieldParser: CommonQueryFilterFieldParser;
  useDirectTableReference: boolean;
};

export const applyFilterEntriesToWhereExpression = ({
  whereExpression,
  outerQueryBuilder,
  objectNameSingular,
  filter,
  fieldParser,
  useDirectTableReference = false,
}: {
  whereExpression: WhereExpressionBuilder;
  outerQueryBuilder: WorkspaceSelectQueryBuilder;
  objectNameSingular: string;
  filter: Record<string, unknown>;
  fieldParser: CommonQueryFilterFieldParser;
  useDirectTableReference?: boolean;
}): void => {
  applyFilterEntries(whereExpression, filter, {
    outerQueryBuilder,
    objectNameSingular,
    fieldParser,
    useDirectTableReference,
  });
};

const applyFilterEntries = (
  whereExpression: WhereExpressionBuilder,
  filter: Record<string, unknown>,
  context: FilterWalkContext,
): void => {
  Object.entries(filter).forEach(([filterKey, filterValue], index) => {
    applyFilterEntry(
      whereExpression,
      filterKey,
      filterValue,
      index === 0,
      context,
    );
  });
};

const applyFilterEntry = (
  whereExpression: WhereExpressionBuilder,
  filterKey: string,
  // oxlint-disable-next-line typescript/no-explicit-any
  filterValue: any,
  isFirst: boolean,
  context: FilterWalkContext,
): void => {
  switch (filterKey) {
    case 'and':
      applyLogicalGroup(whereExpression, filterValue, 'and', isFirst, context);
      break;
    case 'or':
      applyLogicalGroup(whereExpression, filterValue, 'or', isFirst, context);
      break;
    case 'not':
      applyCondition(
        whereExpression,
        new NotBrackets((negatedWhereExpression) => {
          applyFilterEntries(negatedWhereExpression, filterValue, context);
        }),
        isFirst,
      );
      break;
    default:
      context.fieldParser.parse({
        queryBuilder: whereExpression,
        outerQueryBuilder: context.outerQueryBuilder,
        objectNameSingular: context.objectNameSingular,
        key: filterKey,
        filterValue,
        isFirst,
        useDirectTableReference: context.useDirectTableReference,
      });
      break;
  }
};

const applyLogicalGroup = (
  whereExpression: WhereExpressionBuilder,
  filters: Record<string, unknown>[] | Record<string, unknown>,
  logicalOperator: 'and' | 'or',
  isFirst: boolean,
  context: FilterWalkContext,
): void => {
  const filterList = Array.isArray(filters) ? filters : [filters];

  const groupCondition = new Brackets((groupWhereExpression) => {
    filterList.forEach((filter, index) => {
      const elementCondition = new Brackets((elementWhereExpression) => {
        applyFilterEntries(elementWhereExpression, filter, context);
      });

      if (index === 0) {
        groupWhereExpression.where(elementCondition);
      } else if (logicalOperator === 'or') {
        groupWhereExpression.orWhere(elementCondition);
      } else {
        groupWhereExpression.andWhere(elementCondition);
      }
    });
  });

  applyCondition(whereExpression, groupCondition, isFirst);
};

const applyCondition = (
  whereExpression: WhereExpressionBuilder,
  condition: Brackets,
  isFirst: boolean,
): void => {
  if (isFirst) {
    whereExpression.where(condition);
  } else {
    whereExpression.andWhere(condition);
  }
};
