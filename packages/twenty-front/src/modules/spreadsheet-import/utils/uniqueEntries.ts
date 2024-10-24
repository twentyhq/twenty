import uniqBy from 'lodash.uniqby';

import {
  MatchColumnsStepProps,
  MatchedOptions,
} from '@/spreadsheet-import/steps/components/MatchColumnsStep/MatchColumnsStep';

export const uniqueEntries = <T extends string>(
  data: MatchColumnsStepProps['data'],
  index: number,
): Partial<MatchedOptions<T>>[] =>
  uniqBy(
    data.map((row) => ({ entry: row[index] })),
    'entry',
  ).filter(({ entry }) => !!entry);
