import { createComponentReadOnlySelector } from 'twenty-ui';

import { tableColumnsComponentState } from '@/object-record/record-table/states/tableColumnsComponentState';

export const numberOfTableColumnsComponentSelector =
  createComponentReadOnlySelector({
    key: 'numberOfTableColumnsComponentSelector',
    get:
      ({ scopeId }) =>
      ({ get }) =>
        get(tableColumnsComponentState({ scopeId })).length,
  });
