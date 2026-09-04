import { recordIndexAllRecordIdsComponentSelector } from '@/object-record/record-index/states/selectors/recordIndexAllRecordIdsComponentSelector';
import { isRowSelectedComponentFamilyState } from '@/object-record/record-table/record-table-row/states/isRowSelectedComponentFamilyState';
import { RecordTableComponentInstanceContext } from '@/object-record/record-table/states/context/RecordTableComponentInstanceContext';
import { createAtomComponentSelector } from '@/ui/utilities/state/jotai/utils/createAtomComponentSelector';

export const selectedRowIdsComponentSelector = createAtomComponentSelector<
  string[]
>({
  key: 'selectedRowIdsComponentSelector',
  componentInstanceContext: RecordTableComponentInstanceContext,
  get:
    ({ instanceId, surfaceId }) =>
    ({ get }) => {
      const allRecordIds = get(recordIndexAllRecordIdsComponentSelector, {
        instanceId,
        surfaceId,
      });

      return allRecordIds.filter(
        (recordId) =>
          get(isRowSelectedComponentFamilyState, {
            instanceId,
            surfaceId,
            familyKey: recordId,
          }) === true,
      );
    },
});
