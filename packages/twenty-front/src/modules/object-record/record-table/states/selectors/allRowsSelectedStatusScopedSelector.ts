import { createScopedSelector } from '@/ui/utilities/recoil-scope/utils/createScopedSelector';

import { AllRowsSelectedStatus } from '../../types/AllRowSelectedStatus';
import { numberOfTableRowsScopedState } from '../numberOfTableRowsScopedState';

import { selectedRowIdsScopedSelector } from './selectedRowIdsScopedSelector';

export const allRowsSelectedStatusScopedSelector =
  createScopedSelector<AllRowsSelectedStatus>({
    key: 'allRowsSelectedStatusScopedSelector',
    get:
      ({ scopeId }) =>
      ({ get }) => {
        const numberOfRows = get(numberOfTableRowsScopedState({ scopeId }));

        const selectedRowIds = get(selectedRowIdsScopedSelector({ scopeId }));

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
