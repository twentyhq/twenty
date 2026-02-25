import { createAtomComponentFamilyState } from '@/ui/utilities/state/jotai/utils/createAtomComponentFamilyState';
import { RecordBoardComponentInstanceContext } from '@/object-record/record-board/states/contexts/RecordBoardComponentInstanceContext';

export const isRecordBoardCardSelectedComponentFamilyState =
  createAtomComponentFamilyState<boolean, string>({
    key: 'isRecordBoardCardSelectedComponentFamilyState',
    defaultValue: false,
    componentInstanceContext: RecordBoardComponentInstanceContext,
  });
