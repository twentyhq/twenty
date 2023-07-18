import { selector } from 'recoil';

import { entityTableDimensionsState } from './entityTableDimensionsState';

export const numberOfTableColumnsSelectorState = selector<number>({
  key: 'numberOfTableColumnsState',
  get: ({ get }) => {
    const { numberOfColumns } = get(entityTableDimensionsState);

    return numberOfColumns;
  },
});
