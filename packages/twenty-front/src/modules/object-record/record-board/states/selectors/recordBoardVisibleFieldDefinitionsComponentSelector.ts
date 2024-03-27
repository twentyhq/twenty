import { createComponentReadOnlySelector } from 'twenty-ui';

import { recordBoardFieldDefinitionsComponentState } from '@/object-record/record-board/states/recordBoardFieldDefinitionsComponentState';

export const recordBoardVisibleFieldDefinitionsComponentSelector =
  createComponentReadOnlySelector({
    key: 'recordBoardVisibleFieldDefinitionsComponentSelector',
    get:
      ({ scopeId }) =>
      ({ get }) =>
        get(recordBoardFieldDefinitionsComponentState({ scopeId }))
          .filter((field) => field.isVisible)
          .sort((a, b) => a.position - b.position),
  });
