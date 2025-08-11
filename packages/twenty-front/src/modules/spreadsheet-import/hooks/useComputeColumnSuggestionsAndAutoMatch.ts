import { useSpreadsheetImportInternal } from '@/spreadsheet-import/hooks/useSpreadsheetImportInternal';
import {
  initialComputedColumnsSelector,
  matchColumnsState,
} from '@/spreadsheet-import/steps/components/MatchColumnsStep/components/states/initialComputedColumnsState';
import { suggestedFieldsByColumnHeaderState } from '@/spreadsheet-import/steps/components/MatchColumnsStep/components/states/suggestedFieldsByColumnHeaderState';
import { type ImportedRow } from '@/spreadsheet-import/types';
import { getMatchedColumnsWithFuse } from '@/spreadsheet-import/utils/getMatchedColumnsWithFuse';
import { useRecoilCallback } from 'recoil';

export const useComputeColumnSuggestionsAndAutoMatch = () => {
  const { spreadsheetImportFields: fields, autoMapHeaders } =
    useSpreadsheetImportInternal();

  const computeColumnSuggestionsAndAutoMatch = useRecoilCallback(
    ({ set, snapshot }) =>
      async ({
        headerValues,
        data,
      }: {
        headerValues: ImportedRow;
        data: ImportedRow[];
      }) => {
        if (autoMapHeaders) {
          const columns = snapshot
            .getLoadable(initialComputedColumnsSelector(headerValues))
            .getValue();

          const { matchedColumns, suggestedFieldsByColumnHeader } =
            getMatchedColumnsWithFuse({ columns, fields, data });

          set(matchColumnsState, matchedColumns);
          set(
            suggestedFieldsByColumnHeaderState,
            suggestedFieldsByColumnHeader,
          );
        }
      },
    [autoMapHeaders, fields],
  );

  return computeColumnSuggestionsAndAutoMatch;
};
