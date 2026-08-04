import { RecordBoardComponentInstanceContext } from '@/object-record/record-board/states/contexts/RecordBoardComponentInstanceContext';
import { createAtomComponentFamilyState } from '@/ui/utilities/state/jotai/utils/createAtomComponentFamilyState';

export const recordBoardColumnCardHeightByRecordIdComponentFamilyState =
  createAtomComponentFamilyState<Record<string, number>, string>({
    key: 'recordBoardColumnCardHeightByRecordIdComponentFamilyState',
    defaultValue: {},
    componentInstanceContext: RecordBoardComponentInstanceContext,
  });
