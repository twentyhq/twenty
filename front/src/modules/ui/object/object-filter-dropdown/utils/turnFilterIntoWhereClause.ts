import { ViewFilterOperand } from '@/views/types/ViewFilterOperand';
import { QueryMode } from '~/generated/graphql';

import { Filter } from '../types/Filter';

type FilterToTurnIntoWhereClause = Omit<Filter, 'definition'> & {
  definition: {
    type: Filter['definition']['type'];
  };
};

export const turnFilterIntoWhereClause = (
  filter: FilterToTurnIntoWhereClause | undefined,
) => {
  if (!filter) {
    return {};
  }
  switch (filter.operand) {
    case ViewFilterOperand.IsNotNull:
      return {
        [filter.fieldId]: {
          not: null,
        },
      };
    default:
      switch (filter.definition.type) {
        case 'text':
          switch (filter.operand) {
            case ViewFilterOperand.Contains:
              return {
                [filter.fieldId]: {
                  contains: filter.value,
                  mode: QueryMode.Insensitive,
                },
              };
            case ViewFilterOperand.DoesNotContain:
              return {
                [filter.fieldId]: {
                  not: {
                    contains: filter.value,
                    mode: QueryMode.Insensitive,
                  },
                },
              };
            default:
              throw new Error(
                `Unknown operand ${filter.operand} for ${filter.definition.type} filter`,
              );
          }
        case 'number':
          switch (filter.operand) {
            case ViewFilterOperand.GreaterThan:
              return {
                [filter.fieldId]: {
                  gte: parseFloat(filter.value),
                },
              };
            case ViewFilterOperand.LessThan:
              return {
                [filter.fieldId]: {
                  lte: parseFloat(filter.value),
                },
              };
            default:
              throw new Error(
                `Unknown operand ${filter.operand} for ${filter.definition.type} filter`,
              );
          }
        case 'date':
          switch (filter.operand) {
            case ViewFilterOperand.GreaterThan:
              return {
                [filter.fieldId]: {
                  gte: filter.value,
                },
              };
            case ViewFilterOperand.LessThan:
              return {
                [filter.fieldId]: {
                  lte: filter.value,
                },
              };
            default:
              throw new Error(
                `Unknown operand ${filter.operand} for ${filter.definition.type} filter`,
              );
          }
        case 'entity':
          switch (filter.operand) {
            case ViewFilterOperand.Is:
              return {
                [filter.fieldId]: {
                  equals: filter.value,
                },
              };
            case ViewFilterOperand.IsNot:
              return {
                [filter.fieldId]: {
                  not: { equals: filter.value },
                },
              };
            default:
              throw new Error(
                `Unknown operand ${filter.operand} for ${filter.definition.type} filter`,
              );
          }
        default:
          throw new Error('Unknown filter type');
      }
  }
};
