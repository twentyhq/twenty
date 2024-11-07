import { selectedRowIdsComponentSelector } from '@/object-record/record-table/states/selectors/selectedRowIdsComponentSelector';

import { RecordTableComponentInstanceContext } from '@/object-record/record-table/states/context/RecordTableComponentInstanceContext';
import { tableAllRowIdsComponentSelector } from '@/object-record/record-table/states/selectors/tableAllRowIdsComponentSelector';
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
          tableAllRowIdsComponentSelector.selectorFamily({
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
