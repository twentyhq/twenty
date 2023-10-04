import { QueryMode } from '~/generated/graphql';

import { Filter } from '../types/Filter';
import { FilterOperand } from '../types/FilterOperand';

export const turnFilterIntoWhereClause = (filter: Filter) => {
  switch (filter.operand) {
    case FilterOperand.IsNotNull:
      return {
        [filter.key]: {
          not: null,
        },
      };
    default:
      switch (filter.type) {
        case 'text':
          switch (filter.operand) {
            case FilterOperand.Contains:
              return {
                [filter.key]: {
                  contains: filter.value,
                  mode: QueryMode.Insensitive,
                },
              };
            case FilterOperand.DoesNotContain:
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
            case FilterOperand.GreaterThan:
              return {
                [filter.key]: {
                  gte: parseFloat(filter.value),
                },
              };
            case FilterOperand.LessThan:
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
            case FilterOperand.GreaterThan:
              return {
                [filter.key]: {
                  gte: filter.value,
                },
              };
            case FilterOperand.LessThan:
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
            case FilterOperand.Is:
              return {
                [filter.key]: {
                  equals: filter.value,
                },
              };
            case FilterOperand.IsNot:
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
        case 'entities':
          switch (filter.operand) {
            case FilterOperand.IsIn:
              return {
                OR: filter.multipleValues
                  ? filter.multipleValues.map((value) => ({
                      [filter.key]: {
                        equals: value,
                      },
                    }))
                  : [],
              };
            case FilterOperand.IsNotIn:
              return {
                AND: filter.multipleValues
                  ? filter.multipleValues.map((value) => ({
                      [filter.key]: {
                        not: { equals: value },
                      },
                    }))
                  : [],
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
