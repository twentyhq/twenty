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
        [filter.fieldMetadataId]: {
          not: null,
        },
      };
    default:
      switch (filter.definition.type) {
        case 'TEXT':
          switch (filter.operand) {
            case ViewFilterOperand.Contains:
              return {
                [filter.fieldMetadataId]: {
                  contains: filter.value,
                  mode: QueryMode.Insensitive,
                },
              };
            case ViewFilterOperand.DoesNotContain:
              return {
                [filter.fieldMetadataId]: {
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
        case 'NUMBER':
          switch (filter.operand) {
            case ViewFilterOperand.GreaterThan:
              return {
                [filter.fieldMetadataId]: {
                  gte: parseFloat(filter.value),
                },
              };
            case ViewFilterOperand.LessThan:
              return {
                [filter.fieldMetadataId]: {
                  lte: parseFloat(filter.value),
                },
              };
            default:
              throw new Error(
                `Unknown operand ${filter.operand} for ${filter.definition.type} filter`,
              );
          }
        case 'DATE':
          switch (filter.operand) {
            case ViewFilterOperand.GreaterThan:
              return {
                [filter.fieldMetadataId]: {
                  gte: filter.value,
                },
              };
            case ViewFilterOperand.LessThan:
              return {
                [filter.fieldMetadataId]: {
                  lte: filter.value,
                },
              };
            default:
              throw new Error(
                `Unknown operand ${filter.operand} for ${filter.definition.type} filter`,
              );
          }
        case 'ENTITY':
          switch (filter.operand) {
            case ViewFilterOperand.Is:
              return {
                [filter.fieldMetadataId]: {
                  equals: filter.value,
                },
              };
            case ViewFilterOperand.IsNot:
              return {
                [filter.fieldMetadataId]: {
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
