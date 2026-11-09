import { isDefined } from 'twenty-shared/utils';
import {
  type PageLayoutFilter,
  type PageLayoutFilterInput,
} from '~/generated-metadata/graphql';

export const convertPageLayoutFiltersToInput = (
  filters: PageLayoutFilter[] | null,
): PageLayoutFilterInput[] | null =>
  filters?.map(({ id, label, type, position, defaultValue }) => ({
    id,
    label,
    type,
    position,
    defaultValue: isDefined(defaultValue)
      ? {
          conditions: defaultValue.conditions.map(({ operand, value }) => ({
            operand,
            value,
          })),
        }
      : null,
  })) ?? null;
