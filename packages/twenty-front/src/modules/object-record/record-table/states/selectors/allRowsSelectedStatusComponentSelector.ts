import { selectedRowIdsComponentSelector } from '@/object-record/record-table/states/selectors/selectedRowIdsComponentSelector';
import { tableRowIdsComponentState } from '@/object-record/record-table/states/tableRowIdsComponentState';
import { createComponentReadOnlySelector } from '@/ui/utilities/state/component-state/utils/createComponentReadOnlySelector';

import { AllRowsSelectedStatus } from '../../types/AllRowSelectedStatus';

export const allRowsSelectedStatusComponentSelector =
  createComponentReadOnlySelector<AllRowsSelectedStatus>({
    key: 'allRowsSelectedStatusComponentSelector',
    get:
      ({ scopeId }) =>
      ({ get }) => {
        const tableRowIds = get(tableRowIdsComponentState({ scopeId }));

        const selectedRowIds = get(
          selectedRowIdsComponentSelector({ scopeId }),
        );

        const numberOfSelectedRows = selectedRowIds.length;

        const allRowsSelectedStatus =
          numberOfSelectedRows === 0
            ? 'none'
            : selectedRowIds.length === tableRowIds.length
              ? 'all'
              : 'some';

        return allRowsSelectedStatus;
      },
  });
