import { RecordBoardComponentInstanceContext } from '@/object-record/record-board/states/contexts/RecordBoardComponentInstanceContext';
import { recordBoardFieldDefinitionsComponentState } from '@/object-record/record-board/states/recordBoardFieldDefinitionsComponentState';
import { createComponentSelector } from '@/ui/utilities/state/component-state/utils/createComponentSelector';

export const recordBoardVisibleFieldDefinitionsComponentSelector =
  createComponentSelector({
    key: 'recordBoardVisibleFieldDefinitionsComponentSelector',
    get:
      ({ instanceId }) =>
      ({ get }) =>
        get(
          recordBoardFieldDefinitionsComponentState.atomFamily({ instanceId }),
        )
          .filter((field) => field.isVisible)
          .sort((a, b) => a.position - b.position),
    componentInstanceContext: RecordBoardComponentInstanceContext,
  });
