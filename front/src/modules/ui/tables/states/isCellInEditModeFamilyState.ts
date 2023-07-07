import { atomFamily } from 'recoil';

import { CellPosition } from '../types/CellPosition';

export const isCellInEditModeFamilyState = atomFamily<boolean, CellPosition>({
  key: 'isCellInEditModeFamilyState',
  default: false,
});
