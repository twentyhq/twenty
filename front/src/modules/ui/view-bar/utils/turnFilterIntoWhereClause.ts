import { QueryMode, ViewFilterOperand } from '~/generated/graphql';

import { Filter } from '../types/Filter';

export const turnFilterIntoWhereClause = (filter: Filter) => {
  switch (filter.operand) {
    case ViewFilterOperand.IsNotNull:
      return {
        [filter.key]: {
          not: null,
        },
      };
    default:
      switch (filter.type) {
        case 'text':
          switch (filter.operand) {
            case ViewFilterOperand.Contains:
              return {
                [filter.key]: {
                  contains: filter.value,
                  mode: QueryMode.Insensitive,
                },
              };
            case ViewFilterOperand.DoesNotContain:
              return {
                [filter.key]: {
                  not: {
                    contains: filter.value,
                    mode: QueryMode.Insensitive,
                  },
                },
              };
            default:
              throw new Error(
                `Unknown operand ${filter.operand} for ${filter.type} filter`,
              );
          }
        case 'number':
          switch (filter.operand) {
            case ViewFilterOperand.GreaterThan:
              return {
                [filter.key]: {
                  gte: parseFloat(filter.value),
                },
              };
            case ViewFilterOperand.LessThan:
              return {
                [filter.key]: {
                  lte: parseFloat(filter.value),
                },
              };
            default:
              throw new Error(
                `Unknown operand ${filter.operand} for ${filter.type} filter`,
              );
          }
        case 'date':
          switch (filter.operand) {
            case ViewFilterOperand.GreaterThan:
              return {
                [filter.key]: {
                  gte: filter.value,
                },
              };
            case ViewFilterOperand.LessThan:
              return {
                [filter.key]: {
                  lte: filter.value,
                },
              };
            default:
              throw new Error(
                `Unknown operand ${filter.operand} for ${filter.type} filter`,
              );
          }
        case 'entity':
          switch (filter.operand) {
            case ViewFilterOperand.Is:
              return {
                [filter.key]: {
                  equals: filter.value,
                },
              };
            case ViewFilterOperand.IsNot:
              return {
                [filter.key]: {
                  not: { equals: filter.value },
                },
              };
            default:
              throw new Error(
                `Unknown operand ${filter.operand} for ${filter.type} filter`,
              );
          }
        default:
          throw new Error('Unknown filter type');
      }
  }
};
