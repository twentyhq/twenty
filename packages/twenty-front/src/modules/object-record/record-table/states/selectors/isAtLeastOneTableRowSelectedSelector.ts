import { recordIndexAllRecordIdsComponentSelector } from '@/object-record/record-index/states/selectors/recordIndexAllRecordIdsComponentSelector';
import { isRowSelectedComponentFamilyState } from '@/object-record/record-table/record-table-row/states/isRowSelectedComponentFamilyState';
import { RecordTableComponentInstanceContext } from '@/object-record/record-table/states/context/RecordTableComponentInstanceContext';
import { createComponentSelectorV2 } from '@/ui/utilities/state/jotai/utils/createComponentSelectorV2';

export const isAtLeastOneTableRowSelectedSelector =
  createComponentSelectorV2<boolean>({
    key: 'isAtLeastOneTableRowSelectedSelector',
    componentInstanceContext: RecordTableComponentInstanceContext,
    get:
      ({ instanceId }) =>
      ({ get }) => {
        const allRecordIds = get(recordIndexAllRecordIdsComponentSelector, {
          instanceId,
        });

        const isAnyRecordSelected = allRecordIds.some((recordId) =>
          get(isRowSelectedComponentFamilyState, {
            instanceId,
            familyKey: recordId,
          }),
        );

        return isAnyRecordSelected;
      },
  });
