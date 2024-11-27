import { selectedRowIdsComponentSelector } from '@/object-record/record-table/states/selectors/selectedRowIdsComponentSelector';

import { RecordTableComponentInstanceContext } from '@/object-record/record-table/states/context/RecordTableComponentInstanceContext';
import { tableAllRowIdsComponentState } from '@/object-record/record-table/states/tableAllRowIdsComponentState';
import { createComponentSelectorV2 } from '@/ui/utilities/state/component-state/utils/createComponentSelectorV2';
import { AllRowsSelectedStatus } from '../../types/AllRowSelectedStatus';

export const allRowsSelectedStatusComponentSelector =
  createComponentSelectorV2<AllRowsSelectedStatus>({
    key: 'allRowsSelectedStatusComponentSelector',
    componentInstanceContext: RecordTableComponentInstanceContext,
    get:
      ({ instanceId }) =>
      ({ get }) => {
        const tableRowIds = get(
          tableAllRowIdsComponentState.atomFamily({
            instanceId,
          }),
        );

        const selectedRowIds = get(
          selectedRowIdsComponentSelector.selectorFamily({
            instanceId,
          }),
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
