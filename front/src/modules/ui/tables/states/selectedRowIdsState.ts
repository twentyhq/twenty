import { selector } from 'recoil';
import { currentRowSelectionState } from './rowSelectionState';

export const selectedRowIdsState = selector<string[]>({
  key: 'ui/table-selected-row-ids',
  get: ({ get }) => {
    const currentRowSelection = get(currentRowSelectionState);

    return Object.keys(currentRowSelection).filter(
      (key) => currentRowSelection[key] === true,
    );
  },
});
