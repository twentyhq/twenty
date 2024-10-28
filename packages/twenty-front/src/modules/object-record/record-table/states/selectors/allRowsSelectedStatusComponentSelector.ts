import { selectedRowIdsComponentSelector } from '@/object-record/record-table/states/selectors/selectedRowIdsComponentSelector';
import { tableRowIdsComponentState } from '@/object-record/record-table/states/tableRowIdsComponentState';

import { RecordTableScopeInternalContext } from '@/object-record/record-table/scopes/scope-internal-context/RecordTableScopeInternalContext';
import { createComponentSelectorV2 } from '@/ui/utilities/state/component-state/utils/createComponentSelectorV2';
import { AllRowsSelectedStatus } from '../../types/AllRowSelectedStatus';

export const allRowsSelectedStatusComponentSelector =
  createComponentSelectorV2<AllRowsSelectedStatus>({
    key: 'allRowsSelectedStatusComponentSelector',
    componentInstanceContext: RecordTableScopeInternalContext,
    get:
      ({ instanceId }) =>
      ({ get }) => {
        const tableRowIds = get(
          tableRowIdsComponentState.atomFamily({ instanceId }),
        );

        const selectedRowIds = get(
          selectedRowIdsComponentSelector.selectorFamily({ instanceId }),
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
