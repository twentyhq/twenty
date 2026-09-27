import uniqBy from 'lodash.uniqby';

import { type MatchColumnsStepProps } from '@/spreadsheet-import/steps/components/MatchColumnsStep/MatchColumnsStep';
import { type SpreadsheetMatchedOptions } from 'twenty-shared/utils';

export const uniqueEntries = (
  data: MatchColumnsStepProps['data'],
  index: number,
): Partial<SpreadsheetMatchedOptions>[] =>
  uniqBy(
    data.map((row) => ({ entry: row[index] })),
    'entry',
  ).filter(({ entry }) => !!entry);
