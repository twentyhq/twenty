import {
  Columns,
  ColumnType,
} from '@/spreadsheet-import/steps/components/MatchColumnsStep/MatchColumnsStep';
import { ImportedRow } from '@/spreadsheet-import/types';
import { atom, selectorFamily } from 'recoil';

export const matchColumnsState = atom({
  key: 'MatchColumnsState',
  default: [] as Columns<string>,
});

export const initialComputedColumnsSelector = selectorFamily<
  Columns<string>,
  ImportedRow
>({
  key: 'initialComputedColumnsSelector',
  get:
    (headerValues: ImportedRow) =>
    ({ get }) => {
      const currentState = get(matchColumnsState) as Columns<string>;
      if (currentState.length === 0) {
        // Do not remove spread, it indexes empty array elements, otherwise map() skips over them
        const initialState = ([...headerValues] as string[]).map(
          (value, index) => ({
            type: ColumnType.empty,
            index,
            header: value ?? '',
          }),
        );
        return initialState as Columns<string>;
      } else {
        return currentState;
      }
    },
  set:
    () =>
    ({ set }, newValue) => {
      set(matchColumnsState, newValue as Columns<string>);
    },
});
