import { recordIndexAllRecordIdsComponentSelector } from '@/object-record/record-index/states/selectors/recordIndexAllRecordIdsComponentSelector';
import { isRowSelectedComponentFamilyState } from '@/object-record/record-table/record-table-row/states/isRowSelectedComponentFamilyState';
import { RecordTableComponentInstanceContext } from '@/object-record/record-table/states/context/RecordTableComponentInstanceContext';
import { createComponentSelectorV2 } from '@/ui/utilities/state/jotai/utils/createComponentSelectorV2';

export const selectedRowIdsComponentSelector = createComponentSelectorV2<
  string[]
>({
  key: 'selectedRowIdsComponentSelector',
  componentInstanceContext: RecordTableComponentInstanceContext,
  get:
    ({ instanceId }) =>
    ({ get }) => {
      const allRecordIds = get(recordIndexAllRecordIdsComponentSelector, {
        instanceId,
      });

      return allRecordIds.filter(
        (recordId) =>
          get(isRowSelectedComponentFamilyState, {
            instanceId,
            familyKey: recordId,
          }) === true,
      );
    },
});
