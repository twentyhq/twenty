import { recordBoardFieldDefinitionsComponentState } from '@/object-record/record-board/states/recordBoardFieldDefinitionsComponentState';
import { createComponentReadOnlySelector } from '@/ui/utilities/state/component-state/utils/createComponentReadOnlySelector';

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
