import { selectedRowIdsComponentSelector } from '@/object-record/record-table/states/selectors/selectedRowIdsComponentSelector';

import { recordIndexAllRowIdsComponentState } from '@/object-record/record-index/states/recordIndexAllRowIdsComponentState';
import { RecordTableComponentInstanceContext } from '@/object-record/record-table/states/context/RecordTableComponentInstanceContext';
import { createComponentSelectorV2 } from '@/ui/utilities/state/component-state/utils/createComponentSelectorV2';
import { AllRowsSelectedStatus } from '../../types/AllRowSelectedStatus';

export const allRowsSelectedStatusComponentSelector =
  createComponentSelectorV2<AllRowsSelectedStatus>({
    key: 'allRowsSelectedStatusComponentSelector',
    componentInstanceContext: RecordTableComponentInstanceContext,
    get:
      ({ instanceId }) =>
      ({ get }) => {
        const allRowIds = get(
          // TODO: Working because instanceId is the same, but we're not in the same context, should be changed !
          recordIndexAllRowIdsComponentState.atomFamily({
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
            : selectedRowIds.length === allRowIds.length
              ? 'all'
              : 'some';

        return allRowsSelectedStatus;
      },
  });
