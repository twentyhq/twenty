import { tableColumnsComponentState } from '@/object-record/record-table/states/tableColumnsComponentState';
import { createComponentReadOnlySelector } from '@/ui/utilities/state/component-state/utils/createComponentReadOnlySelector';

export const numberOfTableColumnsComponentSelector =
  createComponentReadOnlySelector({
    key: 'numberOfTableColumnsComponentSelector',
    get:
      ({ scopeId }) =>
      ({ get }) =>
        get(tableColumnsComponentState({ scopeId })).length,
  });
