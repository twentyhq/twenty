import { ViewFilterOperand } from '@/views/types/ViewFilterOperand';
import { Field } from '~/generated/graphql';

import { Filter } from '../types/Filter';

type FilterToTurnIntoWhereClause = Omit<Filter, 'definition'> & {
  definition: {
    type: Filter['definition']['type'];
  };
};

export const turnFiltersIntoWhereClause = (
  filters: FilterToTurnIntoWhereClause[],
  fields: Pick<Field, 'id' | 'name'>[],
) => {
  const whereClause: any[] = [];

  filters.forEach((filter) => {
    const correspondingField = fields.find(
      (field) => field.id === filter.fieldMetadataId,
    );
    if (!correspondingField) {
      throw new Error(
        `Could not find field ${filter.fieldMetadataId} in metadata object`,
      );
    }

    switch (filter.definition.type) {
      case 'EMAIL':
      case 'PHONE':
      case 'TEXT':
        switch (filter.operand) {
          case ViewFilterOperand.Contains:
            whereClause.push({
              [correspondingField.name]: {
                ilike: `%${filter.value}%`,
              },
            });
            return;
          case ViewFilterOperand.DoesNotContain:
            whereClause.push({
              not: {
                [correspondingField.name]: {
                  ilike: `%${filter.value}%`,
                },
              },
            });
            return;
          default:
            throw new Error(
              `Unknown operand ${filter.operand} for ${filter.definition.type} filter`,
            );
        }
      case 'DATE_TIME':
        switch (filter.operand) {
          case ViewFilterOperand.GreaterThan:
            whereClause.push({
              [correspondingField.name]: {
                gte: filter.value,
              },
            });
            return;
          case ViewFilterOperand.LessThan:
            whereClause.push({
              [correspondingField.name]: {
                lte: filter.value,
              },
            });
            return;
          default:
            throw new Error(
              `Unknown operand ${filter.operand} for ${filter.definition.type} filter`,
            );
        }
      case 'NUMBER':
        switch (filter.operand) {
          case ViewFilterOperand.GreaterThan:
            whereClause.push({
              [correspondingField.name]: {
                gte: parseFloat(filter.value),
              },
            });
            return;
          case ViewFilterOperand.LessThan:
            whereClause.push({
              [correspondingField.name]: {
                lte: parseFloat(filter.value),
              },
            });
            return;
          default:
            throw new Error(
              `Unknown operand ${filter.operand} for ${filter.definition.type} filter`,
            );
        }
      case 'RELATION':
        switch (filter.operand) {
          case ViewFilterOperand.Is:
            whereClause.push({
              [correspondingField.name + 'Id']: {
                eq: filter.value,
              },
            });
            return;
          case ViewFilterOperand.IsNot:
            whereClause.push({
              [correspondingField.name + 'Id']: {
                neq: filter.value,
              },
            });
            return;
          default:
            throw new Error(
              `Unknown operand ${filter.operand} for ${filter.definition.type} filter`,
            );
        }
      case 'CURRENCY':
        switch (filter.operand) {
          case ViewFilterOperand.GreaterThan:
            whereClause.push({
              [correspondingField.name]: {
                amountMicros: { gte: parseFloat(filter.value) * 1000000 },
              },
            });
            return;
          case ViewFilterOperand.LessThan:
            whereClause.push({
              [correspondingField.name]: {
                amountMicros: { lte: parseFloat(filter.value) * 1000000 },
              },
            });
            return;
          default:
            throw new Error(
              `Unknown operand ${filter.operand} for ${filter.definition.type} filter`,
            );
        }
      case 'LINK':
        switch (filter.operand) {
          case ViewFilterOperand.Contains:
            whereClause.push({
              [correspondingField.name]: {
                url: {
                  ilike: `%${filter.value}%`,
                },
              },
            });
            return;
          case ViewFilterOperand.DoesNotContain:
            whereClause.push({
              not: {
                [correspondingField.name]: {
                  url: {
                    ilike: `%${filter.value}%`,
                  },
                },
              },
            });
            return;
          default:
            throw new Error(
              `Unknown operand ${filter.operand} for ${filter.definition.type} filter`,
            );
        }
      case 'FULL_NAME':
        switch (filter.operand) {
          case ViewFilterOperand.Contains:
            whereClause.push({
              or: [
                {
                  [correspondingField.name]: {
                    firstName: {
                      ilike: `%${filter.value}%`,
                    },
                  },
                },
                {
                  [correspondingField.name]: {
                    firstName: {
                      ilike: `%${filter.value}%`,
                    },
                  },
                },
              ],
            });
            return;
          case ViewFilterOperand.DoesNotContain:
            whereClause.push({
              and: [
                {
                  not: {
                    [correspondingField.name]: {
                      firstName: {
                        ilike: `%${filter.value}%`,
                      },
                    },
                  },
                },
                {
                  not: {
                    [correspondingField.name]: {
                      lastName: {
                        ilike: `%${filter.value}%`,
                      },
                    },
                  },
                },
              ],
            });
            return;
          default:
            throw new Error(
              `Unknown operand ${filter.operand} for ${filter.definition.type} filter`,
            );
        }
      default:
        throw new Error('Unknown filter type');
    }
  });

  return { and: whereClause };
};
