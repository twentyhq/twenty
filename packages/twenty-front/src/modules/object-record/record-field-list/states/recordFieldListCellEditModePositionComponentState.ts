import { RecordFieldListComponentInstanceContext } from '@/object-record/record-field-list/states/contexts/RecordFieldListComponentInstanceContext';
import { createAtomComponentState } from '@/ui/utilities/state/jotai/utils/createAtomComponentState';

export const recordFieldListCellEditModePositionComponentState =
  createAtomComponentState<number | null>({
    key: 'recordFieldListCellEditModePositionComponentState',
    defaultValue: null,
    componentInstanceContext: RecordFieldListComponentInstanceContext,
  });
