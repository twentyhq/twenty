import { selector } from 'recoil';

import { AllRowsSelectedStatus } from '../types/AllRowSelectedStatus';

import { numberOfSelectedRowState } from './numberOfSelectedRowState';
import { numberOfTableRowsSelectorState } from './numberOfTableRowsSelectorState';

export const allRowsSelectedStatusSelector = selector<AllRowsSelectedStatus>({
  key: 'allRowsSelectedStatusSelector',
  get: ({ get }) => {
    const numberOfRows = get(numberOfTableRowsSelectorState);

    const numberOfSelectedRows = get(numberOfSelectedRowState);

    const allRowsSelectedStatus =
      numberOfSelectedRows === 0
        ? 'none'
        : numberOfRows === numberOfSelectedRows
        ? 'all'
        : 'some';

    return allRowsSelectedStatus;
  },
});
