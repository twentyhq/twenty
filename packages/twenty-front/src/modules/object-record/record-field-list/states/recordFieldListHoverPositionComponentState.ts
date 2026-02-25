import { RecordFieldListComponentInstanceContext } from '@/object-record/record-field-list/states/contexts/RecordFieldListComponentInstanceContext';
import { createAtomComponentState } from '@/ui/utilities/state/jotai/utils/createAtomComponentState';

export const recordFieldListHoverPositionComponentState =
  createAtomComponentState<number | null>({
    key: 'recordFieldListHoverPositionComponentState',
    defaultValue: null,
    componentInstanceContext: RecordFieldListComponentInstanceContext,
  });
