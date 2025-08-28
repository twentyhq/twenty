import { RecordTableComponentInstanceContext } from '@/object-record/record-table/states/context/RecordTableComponentInstanceContext';
import { tableColumnsComponentState } from '@/object-record/record-table/states/tableColumnsComponentState';
import { createComponentSelector } from '@/ui/utilities/state/component-state/utils/createComponentSelector';

export const visibleTableColumnsComponentSelector = createComponentSelector({
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
