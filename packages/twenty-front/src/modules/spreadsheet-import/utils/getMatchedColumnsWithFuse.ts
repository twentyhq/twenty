import { MatchColumnsStepProps } from '@/spreadsheet-import/steps/components/MatchColumnsStep/MatchColumnsStep';

import {
  SpreadsheetImportField,
  SpreadsheetImportFields,
} from '@/spreadsheet-import/types';
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
    ignoreLocation: true,
    threshold: 0.3,
  });

  const suggestedFieldsByColumnHeader: Record<
    SpreadsheetColumn<T>['header'],
    SpreadsheetImportField<T>[]
  > = {};

  for (const column of columns) {
    const fieldsThatMatch = fieldsToSearch.search(column.header);

    const firstMatch = fieldsThatMatch[0] || null;
    const secondMatch = fieldsThatMatch[1] || null;

    const isFirstMatchValid =
      isDefined(firstMatch?.item) &&
      isDefined(firstMatch?.score) &&
      firstMatch.score < 0.4 &&
      ((isDefined(secondMatch?.score) &&
        secondMatch.score !== firstMatch.score) ||
        !isDefined(secondMatch));

    suggestedFieldsByColumnHeader[column.header] = fieldsThatMatch.map(
      (match) => match.item as SpreadsheetImportField<T>,
    );

    if (isFirstMatchValid) {
      const newColumn = setColumn(column, firstMatch.item as any, data);

      matchedColumns.push(newColumn);
    } else {
      matchedColumns.push(column);
    }
  }

  return { matchedColumns, suggestedFieldsByColumnHeader };
};
