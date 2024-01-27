import { createSelectorReadOnlyScopeMap } from '@/ui/utilities/recoil-scope/utils/createSelectorReadOnlyScopeMap';

import { AllRowsSelectedStatus } from '../../types/AllRowSelectedStatus';
import { numberOfTableRowsStateScopeMap } from '../numberOfTableRowsStateScopeMap';

import { selectedRowIdsSelectorScopeMap } from './selectedRowIdsSelectorScopeMap';

export const allRowsSelectedStatusSelectorScopeMap =
  createSelectorReadOnlyScopeMap<AllRowsSelectedStatus>({
    key: 'allRowsSelectedStatusSelectorScopeMap',
    get:
      ({ scopeId }) =>
      ({ get }) => {
        const numberOfRows = get(numberOfTableRowsStateScopeMap({ scopeId }));

        const selectedRowIds = get(selectedRowIdsSelectorScopeMap({ scopeId }));

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
