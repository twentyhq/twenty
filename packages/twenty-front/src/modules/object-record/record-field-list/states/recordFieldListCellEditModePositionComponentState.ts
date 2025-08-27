import { RecordFieldListComponentInstanceContext } from '@/object-record/record-field-list/states/contexts/RecordFieldListComponentInstanceContext';
import { createComponentState } from '@/ui/utilities/state/component-state/utils/createComponentState';

export const recordFieldListCellEditModePositionComponentState =
  createComponentState<number | null>({
    key: 'recordFieldListCellEditModePositionComponentState',
    defaultValue: null,
    componentInstanceContext: RecordFieldListComponentInstanceContext,
  });
