import { atom } from 'recoil';

import { TableDimensions } from '../hooks/useInitializeEntityTableV2';

export const entityTableDimensionsState = atom<TableDimensions>({
  key: 'entityTableDimensionsState',
  default: {
    numberOfRows: 0,
    numberOfColumns: 0,
  },
});
