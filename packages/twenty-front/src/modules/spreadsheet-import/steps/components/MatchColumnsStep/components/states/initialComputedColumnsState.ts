import { type ImportedRow } from '@/spreadsheet-import/types';
import { type SpreadsheetColumns } from '@/spreadsheet-import/types/SpreadsheetColumns';
import { SpreadsheetColumnType } from '@/spreadsheet-import/types/SpreadsheetColumnType';
import { createStateV2 } from '@/ui/utilities/state/jotai/utils/createStateV2';
import { createWritableFamilySelectorV2 } from '@/ui/utilities/state/jotai/utils/createWritableFamilySelectorV2';

export const matchColumnsState = createStateV2<SpreadsheetColumns>({
  key: 'MatchColumnsState',
  defaultValue: [] as SpreadsheetColumns,
});

export const initialComputedColumnsSelector = createWritableFamilySelectorV2<
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
