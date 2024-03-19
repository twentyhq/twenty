import { tableColumnsComponentState } from '@/object-record/record-table/states/tableColumnsComponentState';
import { createComponentReadOnlySelector } from '@/ui/utilities/state/component-state/utils/createComponentReadOnlySelector';

export const visibleTableColumnsComponentSelector =
  createComponentReadOnlySelector({
    key: 'visibleTableColumnsComponentSelector',
    get:
      ({ scopeId }) =>
      ({ get }) => {
        const columns = get(tableColumnsComponentState({ scopeId }));
        return columns
          .filter((column) => column.isVisible)
          .sort((columnA, columnB) => columnA.position - columnB.position);
      },
  });
