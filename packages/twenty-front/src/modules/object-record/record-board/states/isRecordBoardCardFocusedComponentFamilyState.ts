import { RecordBoardComponentInstanceContext } from '@/object-record/record-board/states/contexts/RecordBoardComponentInstanceContext';
import { type BoardCardIndexes } from '@/object-record/record-board/types/BoardCardIndexes';
import { createComponentFamilyStateV2 } from '@/ui/utilities/state/jotai/utils/createComponentFamilyStateV2';

export const isRecordBoardCardFocusedComponentFamilyState =
  createComponentFamilyStateV2<boolean, BoardCardIndexes>({
    key: 'isRecordBoardCardFocusedComponentFamilyState',
    defaultValue: false,
    componentInstanceContext: RecordBoardComponentInstanceContext,
  });
