import { ViewFilterOperand } from '@/views/types/ViewFilterOperand';
import { Field } from '~/generated/graphql';

import { Filter } from '../types/Filter';

type FilterToTurnIntoWhereClause = Omit<Filter, 'definition'> & {
  definition: {
    type: Filter['definition']['type'];
  };
};

export const turnFiltersIntoWhereClauseV2 = (
  filters: FilterToTurnIntoWhereClause[],
  fields: Pick<Field, 'id' | 'name'>[],
) => {
  const whereClause: Record<string, any> = {};

  filters.forEach((filter) => {
    const correspondingField = fields.find(
      (field) => field.id === filter.fieldId,
    );
    if (!correspondingField) {
      throw new Error(
        `Could not find field ${filter.fieldId} in metadata object`,
      );
    }

    switch (filter.definition.type) {
      case 'TEXT':
        switch (filter.operand) {
          case ViewFilterOperand.Contains:
            whereClause[correspondingField.name] = {
              eq: filter.value,
            };
            return;
          case ViewFilterOperand.DoesNotContain:
            whereClause[correspondingField.name] = {
              not: {
                eq: filter.value,
              },
            };
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
  return whereClause;
};
