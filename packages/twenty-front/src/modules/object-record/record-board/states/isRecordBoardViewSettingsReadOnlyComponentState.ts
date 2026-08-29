import { RecordBoardComponentInstanceContext } from '@/object-record/record-board/states/contexts/RecordBoardComponentInstanceContext';
import { createAtomComponentState } from '@/ui/utilities/state/jotai/utils/createAtomComponentState';

// Locks the board chrome that edits the backing view's settings (add
// group, column reorder/resize/menu, aggregate pickers) plus the bulk
// selection and per-column record creation affordances that dashboard
// widgets don't wire up. Record data itself stays editable: card drag
// still updates records, gated by object permissions as usual.
export const isRecordBoardViewSettingsReadOnlyComponentState =
  createAtomComponentState<boolean>({
    key: 'isRecordBoardViewSettingsReadOnlyComponentState',
    defaultValue: false,
    componentInstanceContext: RecordBoardComponentInstanceContext,
  });
