import { selector } from 'recoil';

import { entityTableDimensionsState } from './entityTableDimensionsState';

export const numberOfTableRowsSelectorState = selector<number>({
  key: 'numberOfTableRowsState',
  get: ({ get }) => {
    const { numberOfRows } = get(entityTableDimensionsState);

    return numberOfRows;
  },
});
