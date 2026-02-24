import { createComponentFamilyState } from '@/ui/utilities/state/jotai/utils/createComponentFamilyState';
import { RecordBoardComponentInstanceContext } from '@/object-record/record-board/states/contexts/RecordBoardComponentInstanceContext';

export const isRecordBoardCardSelectedComponentFamilyState =
  createComponentFamilyState<boolean, string>({
    key: 'isRecordBoardCardSelectedComponentFamilyState',
    defaultValue: false,
    componentInstanceContext: RecordBoardComponentInstanceContext,
  });
