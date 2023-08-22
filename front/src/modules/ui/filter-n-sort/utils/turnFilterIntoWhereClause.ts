import { QueryMode } from '~/generated/graphql';

import { Filter } from '../types/Filter';
import { FilterOperand } from '../types/FilterOperand';

export function turnFilterIntoWhereClause(filter: Filter) {
  switch (filter.type) {
    case 'text':
      switch (filter.operand) {
        case FilterOperand.Contains:
          return {
            [filter.field]: {
              contains: filter.value,
              mode: QueryMode.Insensitive,
            },
          };
        case FilterOperand.DoesNotContain:
          return {
            [filter.field]: {
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
            [filter.field]: {
              gte: parseFloat(filter.value),
            },
          };
        case FilterOperand.LessThan:
          return {
            [filter.field]: {
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
            [filter.field]: {
              gte: filter.value,
            },
          };
        case FilterOperand.LessThan:
          return {
            [filter.field]: {
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
            [filter.field]: {
              equals: filter.value,
            },
          };
        case FilterOperand.IsNot:
          return {
            [filter.field]: {
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
