import { recordIndexAllRecordIdsComponentSelector } from '@/object-record/record-index/states/selectors/recordIndexAllRecordIdsComponentSelector';
import { isRowSelectedComponentFamilyState } from '@/object-record/record-table/record-table-row/states/isRowSelectedComponentFamilyState';
import { RecordTableComponentInstanceContext } from '@/object-record/record-table/states/context/RecordTableComponentInstanceContext';
import { createComponentSelector } from '@/ui/utilities/state/component-state/utils/createComponentSelector';

export const unselectedRowIdsComponentSelector = createComponentSelector<
  string[]
>({
  key: 'unselectedRowIdsComponentSelector',
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

      return allRecordIds.filter(
        (recordId) =>
          get(
            isRowSelectedComponentFamilyState.atomFamily({
              instanceId,
              familyKey: recordId,
            }),
          ) === false,
      );
    },
});
