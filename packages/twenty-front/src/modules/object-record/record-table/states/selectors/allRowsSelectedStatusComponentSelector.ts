import { selectedRowIdsComponentSelector } from '@/object-record/record-table/states/selectors/selectedRowIdsComponentSelector';

import { recordIndexAllRecordIdsComponentSelector } from '@/object-record/record-index/states/selectors/recordIndexAllRecordIdsComponentSelector';
import { RecordTableComponentInstanceContext } from '@/object-record/record-table/states/context/RecordTableComponentInstanceContext';
import { createComponentSelector } from '@/ui/utilities/state/component-state/utils/createComponentSelector';
import { type AllRowsSelectedStatus } from '@/object-record/record-table/types/AllRowSelectedStatus';

export const allRowsSelectedStatusComponentSelector =
  createComponentSelector<AllRowsSelectedStatus>({
    key: 'allRowsSelectedStatusComponentSelector',
    componentInstanceContext: RecordTableComponentInstanceContext,
    get:
      ({ instanceId }) =>
      ({ get }) => {
        const allRecordIds = get(
          // TODO: Working because instanceId is the same, but we're not in the same context, should be changed !
          recordIndexAllRecordIdsComponentSelector.selectorFamily({
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
            : selectedRowIds.length === allRecordIds.length
              ? 'all'
              : 'some';

        return allRowsSelectedStatus;
      },
  });
