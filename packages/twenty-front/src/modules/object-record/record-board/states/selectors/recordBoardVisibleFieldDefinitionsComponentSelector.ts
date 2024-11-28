import { RecordBoardComponentInstanceContext } from '@/object-record/record-board/states/contexts/RecordBoardComponentInstanceContext';
import { recordBoardFieldDefinitionsComponentState } from '@/object-record/record-board/states/recordBoardFieldDefinitionsComponentState';
import { createComponentSelectorV2 } from '@/ui/utilities/state/component-state/utils/createComponentSelectorV2';

export const recordBoardVisibleFieldDefinitionsComponentSelector =
  createComponentSelectorV2({
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
