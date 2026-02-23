import { createComponentFamilyStateV2 } from '@/ui/utilities/state/jotai/utils/createComponentFamilyStateV2';
import { RecordBoardComponentInstanceContext } from '@/object-record/record-board/states/contexts/RecordBoardComponentInstanceContext';

export const isRecordBoardCardSelectedComponentFamilyState =
  createComponentFamilyStateV2<boolean, string>({
    key: 'isRecordBoardCardSelectedComponentFamilyState',
    defaultValue: false,
    componentInstanceContext: RecordBoardComponentInstanceContext,
  });
