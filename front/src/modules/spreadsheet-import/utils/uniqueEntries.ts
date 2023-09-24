import uniqBy from 'lodash/uniqBy';

import {
  type MatchColumnsProps,
  type MatchedOptions,
} from '@/spreadsheet-import/steps/components/MatchColumnsStep/MatchColumnsStep';

export const uniqueEntries = <T extends string>(
  data: MatchColumnsProps<T>['data'],
  index: number,
): Partial<MatchedOptions<T>>[] =>
  uniqBy(
    data.map((row) => ({ entry: row[index] })),
    'entry',
  ).filter(({ entry }) => !!entry);
