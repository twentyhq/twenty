import { isNull } from '@sniptt/guards';
import { type OrderBy } from 'twenty-shared/types';
import { doNotTranslate } from 'twenty-shared/i18n';

import { sortAsc, sortDesc, sortNullsFirst, sortNullsLast } from '~/utils/sort';

export const compareSortableValues = ({
  valueA,
  valueB,
  direction,
}: {
  valueA: string | number | null;
  valueB: string | number | null;
  direction: OrderBy;
}): number => {
  if (isNull(valueA) || isNull(valueB)) {
    return direction.endsWith('NullsFirst')
      ? sortNullsFirst(valueA, valueB)
      : sortNullsLast(valueA, valueB);
  }

  return direction.startsWith(doNotTranslate('Asc'))
    ? sortAsc(valueA, valueB)
    : sortDesc(valueA, valueB);
};
