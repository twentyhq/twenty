import { type ImportedRow } from '@/spreadsheet-import/types';
import { type SpreadsheetColumns } from '@/spreadsheet-import/types/SpreadsheetColumns';
import { SpreadsheetColumnType } from '@/spreadsheet-import/types/SpreadsheetColumnType';
import { createState } from '@/ui/utilities/state/jotai/utils/createState';
import { createWritableFamilySelector } from '@/ui/utilities/state/jotai/utils/createWritableFamilySelector';

export const matchColumnsState = createState<SpreadsheetColumns>({
  key: 'MatchColumnsState',
  defaultValue: [] as SpreadsheetColumns,
});

export const initialComputedColumnsSelector = createWritableFamilySelector<
  SpreadsheetColumns,
  ImportedRow
>({
  key: 'initialComputedColumnsSelector',
  get:
    (headerValues: ImportedRow) =>
    ({ get }) => {
      const currentState = get(matchColumnsState) as SpreadsheetColumns;
      if (currentState.length === 0) {
        // Do not remove spread, it indexes empty array elements, otherwise map() skips over them
        const initialState = ([...headerValues] as string[]).map(
          (value, index) => ({
            type: SpreadsheetColumnType.empty,
            index,
            header: value ?? '',
          }),
        );
        return initialState as SpreadsheetColumns;
      } else {
        return currentState;
      }
    },
  set:
    () =>
    ({ set }, newValue) => {
      set(matchColumnsState, newValue as SpreadsheetColumns);
    },
});
