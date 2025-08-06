import { recordIndexAllRecordIdsComponentSelector } from '@/object-record/record-index/states/selectors/recordIndexAllRecordIdsComponentSelector';
import { isRowSelectedComponentFamilyState } from '@/object-record/record-table/record-table-row/states/isRowSelectedComponentFamilyState';
import { RecordTableComponentInstanceContext } from '@/object-record/record-table/states/context/RecordTableComponentInstanceContext';
import { createComponentSelector } from '@/ui/utilities/state/component-state/utils/createComponentSelector';

export const isAtLeastOneTableRowSelectedSelector =
  createComponentSelector<boolean>({
    key: 'isAtLeastOneTableRowSelectedSelector',
    componentInstanceContext: RecordTableComponentInstanceContext,
    get:
      ({ instanceId }) =>
      ({ get }) => {
        const allRecordIds = get(
          recordIndexAllRecordIdsComponentSelector.selectorFamily({
            instanceId,
          }),
        );

        const isAnyRecordSelected = allRecordIds.some((recordId) =>
          get(
            isRowSelectedComponentFamilyState.atomFamily({
              instanceId,
              familyKey: recordId,
            }),
          ),
        );

        return isAnyRecordSelected;
      },
  });
