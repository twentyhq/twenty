import { RecordFieldListComponentInstanceContext } from '@/object-record/record-field-list/states/contexts/RecordFieldListComponentInstanceContext';
import { createComponentStateV2 } from '@/ui/utilities/state/jotai/utils/createComponentStateV2';

export const recordFieldListHoverPositionComponentState =
  createComponentStateV2<number | null>({
    key: 'recordFieldListHoverPositionComponentState',
    defaultValue: null,
    componentInstanceContext: RecordFieldListComponentInstanceContext,
  });
