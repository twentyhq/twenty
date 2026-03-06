import { type ImportedRow } from '@/spreadsheet-import/types';
import { type SpreadsheetColumns } from '@/spreadsheet-import/types/SpreadsheetColumns';
import { SpreadsheetColumnType } from '@/spreadsheet-import/types/SpreadsheetColumnType';
import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';
import { createAtomWritableFamilySelector } from '@/ui/utilities/state/jotai/utils/createAtomWritableFamilySelector';

export const matchColumnsState = createAtomState<SpreadsheetColumns>({
  key: 'MatchColumnsState',
  defaultValue: [] as SpreadsheetColumns,
});

export const initialComputedColumnsSelector = createAtomWritableFamilySelector<
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
