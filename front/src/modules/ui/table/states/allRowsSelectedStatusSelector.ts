import { selector } from 'recoil';

import { AllRowsSelectedStatus } from '../types/AllRowSelectedStatus';

import { numberOfTableRowsState } from './numberOfTableRowsState';
import { selectedRowIdsSelector } from './selectedRowIdsSelector';

export const allRowsSelectedStatusSelector = selector<AllRowsSelectedStatus>({
  key: 'allRowsSelectedStatusSelector',
  get: ({ get }) => {
    const numberOfRows = get(numberOfTableRowsState);

    const selectedRowIds = get(selectedRowIdsSelector);

    const numberOfSelectedRows = selectedRowIds.length;

    const allRowsSelectedStatus =
      numberOfSelectedRows === 0
        ? 'none'
        : numberOfRows === numberOfSelectedRows
        ? 'all'
        : 'some';

    return allRowsSelectedStatus;
  },
});
