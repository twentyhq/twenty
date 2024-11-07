import { RecordTableComponentInstanceContext } from '@/object-record/record-table/states/context/RecordTableComponentInstanceContext';
import { tableRowIdsByGroupComponentState } from '@/object-record/record-table/states/tableRowIdsByGroupComponentState';
import { createComponentSelectorV2 } from '@/ui/utilities/state/component-state/utils/createComponentSelectorV2';

export const tableAllRowIdsComponentSelector = createComponentSelectorV2<
  string[]
>({
  key: 'tableAllRowIdsComponentSelector',
  componentInstanceContext: RecordTableComponentInstanceContext,
  get:
    ({ instanceId }) =>
    ({ get }) => {
      console.log('GETT !!!');
      const tableRowIdsByGroup = get(
        tableRowIdsByGroupComponentState.atomFamily({ instanceId }),
      );
      const rowIds = Array.from(tableRowIdsByGroup.values()).flat();

      console.log('tableAllRowIdsComponentSelector', rowIds);

      return rowIds;
    },
});
