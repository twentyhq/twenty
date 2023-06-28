import { atom } from 'recoil';

import { TableDimensions } from '../hooks/useInitializeEntityTable';

export const entityTableDimensionsState = atom<TableDimensions>({
  key: 'entityTableDimensionsState',
  default: {
    numberOfRows: 0,
    numberOfColumns: 0,
  },
});
