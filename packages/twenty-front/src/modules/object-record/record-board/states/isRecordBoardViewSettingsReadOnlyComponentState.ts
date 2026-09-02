import { RecordBoardComponentInstanceContext } from '@/object-record/record-board/states/contexts/RecordBoardComponentInstanceContext';
import { createAtomComponentState } from '@/ui/utilities/state/jotai/utils/createAtomComponentState';

export const isRecordBoardViewSettingsReadOnlyComponentState =
  createAtomComponentState<boolean>({
    key: 'isRecordBoardViewSettingsReadOnlyComponentState',
    defaultValue: false,
    componentInstanceContext: RecordBoardComponentInstanceContext,
  });
