import { RecordTableComponentInstanceContext } from '@/object-record/record-table/states/context/RecordTableComponentInstanceContext';
import { tableColumnsComponentState } from '@/object-record/record-table/states/tableColumnsComponentState';
import { createComponentSelectorV2 } from '@/ui/utilities/state/component-state/utils/createComponentSelectorV2';

export const visibleTableColumnsComponentSelector = createComponentSelectorV2({
  key: 'visibleTableColumnsComponentSelector',
  componentInstanceContext: RecordTableComponentInstanceContext,
  get:
    ({ instanceId }) =>
    ({ get }) => {
      const columns = get(
        tableColumnsComponentState.atomFamily({ instanceId }),
      );

      return columns
        .filter((column) => column.isVisible)
        .sort((columnA, columnB) => columnA.position - columnB.position);
    },
});
