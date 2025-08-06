import { RecordBoardComponentInstanceContext } from '@/object-record/record-board/states/contexts/RecordBoardComponentInstanceContext';
import { BoardCardIndexes } from '@/object-record/record-board/types/BoardCardIndexes';
import { createComponentFamilyState } from '@/ui/utilities/state/component-state/utils/createComponentFamilyState';

export const isRecordBoardCardActiveComponentFamilyState =
  createComponentFamilyState<boolean, BoardCardIndexes>({
    key: 'isRecordBoardCardActiveComponentFamilyState',
    defaultValue: false,
    componentInstanceContext: RecordBoardComponentInstanceContext,
  });
