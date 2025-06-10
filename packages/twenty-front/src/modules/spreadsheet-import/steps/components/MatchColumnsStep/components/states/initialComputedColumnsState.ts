import { ImportedRow } from '@/spreadsheet-import/types';
import { SpreadsheetColumns } from '@/spreadsheet-import/types/SpreadsheetColumns';
import { SpreadsheetColumnType } from '@/spreadsheet-import/types/SpreadsheetColumnType';
import { atom, selectorFamily } from 'recoil';

export const matchColumnsState = atom({
  key: 'MatchColumnsState',
  default: [] as SpreadsheetColumns<string>,
});

export const initialComputedColumnsSelector = selectorFamily<
  SpreadsheetColumns<string>,
  ImportedRow
>({
  key: 'initialComputedColumnsSelector',
  get:
    (headerValues: ImportedRow) =>
    ({ get }) => {
      const currentState = get(matchColumnsState) as SpreadsheetColumns<string>;
      if (currentState.length === 0) {
        // Do not remove spread, it indexes empty array elements, otherwise map() skips over them
        const initialState = ([...headerValues] as string[]).map(
          (value, index) => ({
            type: SpreadsheetColumnType.empty,
            index,
            header: value ?? '',
          }),
        );
        return initialState as SpreadsheetColumns<string>;
      } else {
        return currentState;
      }
    },
  set:
    () =>
    ({ set }, newValue) => {
      set(matchColumnsState, newValue as SpreadsheetColumns<string>);
    },
});
