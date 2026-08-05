import { RecordBoardComponentInstanceContext } from '@/object-record/record-board/states/contexts/RecordBoardComponentInstanceContext';
import { type RecordBoardColumnCardWindow } from '@/object-record/record-board/virtualization/types/RecordBoardColumnCardWindow';
import { createAtomComponentFamilyState } from '@/ui/utilities/state/jotai/utils/createAtomComponentFamilyState';

export const recordBoardColumnCardWindowComponentFamilyState =
  createAtomComponentFamilyState<RecordBoardColumnCardWindow | null, string>({
    key: 'recordBoardColumnCardWindowComponentFamilyState',
    defaultValue: null,
    componentInstanceContext: RecordBoardComponentInstanceContext,
  });
