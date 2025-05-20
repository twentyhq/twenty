import { MatchColumnsStepProps } from '@/spreadsheet-import/steps/components/MatchColumnsStep/MatchColumnsStep';

import { SpreadsheetImportFields } from '@/spreadsheet-import/types';
import { SpreadsheetColumn } from '@/spreadsheet-import/types/SpreadsheetColumn';
import { SpreadsheetColumns } from '@/spreadsheet-import/types/SpreadsheetColumns';
import { setColumn } from '@/spreadsheet-import/utils/setColumn';
import Fuse from 'fuse.js';
import { isDefined } from 'twenty-shared/utils';

export const getMatchedColumnsWithFuse = <T extends string>(
  columns: SpreadsheetColumns<T>,
  fields: SpreadsheetImportFields<T>,
  data: MatchColumnsStepProps['data'],
) => {
  const matchedColumns: SpreadsheetColumn<T>[] = [];

  const fieldsToSearch = new Fuse(fields, {
    keys: ['label'],
    includeScore: true,
    threshold: 0.3,
  });

  for (const column of columns) {
    const fieldsThatMatch = fieldsToSearch.search(column.header);

    const firstMatch = fieldsThatMatch[0]?.item ?? null;

    if (isDefined(firstMatch)) {
      const newColumn = setColumn(column, firstMatch as any, data);

      matchedColumns.push(newColumn);
    } else {
      matchedColumns.push(column);
    }
  }

  return { matchedColumns };
};
