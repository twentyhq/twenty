import { RecordBoardComponentInstanceContext } from '@/object-record/record-board/states/contexts/RecordBoardComponentInstanceContext';
import { type BoardCardIndexes } from '@/object-record/record-board/types/BoardCardIndexes';
import { createComponentFamilyState } from '@/ui/utilities/state/jotai/utils/createComponentFamilyState';

export const isRecordBoardCardActiveComponentFamilyState =
  createComponentFamilyState<boolean, BoardCardIndexes>({
    key: 'isRecordBoardCardActiveComponentFamilyState',
    defaultValue: false,
    componentInstanceContext: RecordBoardComponentInstanceContext,
  });
