import { RecordBoardComponentInstanceContext } from '@/object-record/record-board/states/contexts/RecordBoardComponentInstanceContext';
import { createAtomComponentFamilyState } from '@/ui/utilities/state/jotai/utils/createAtomComponentFamilyState';

export const recordBoardShouldFetchMoreInColumnComponentFamilyState =
  createAtomComponentFamilyState<boolean, string>({
    key: 'recordBoardShouldFetchMoreInColumnComponentFamilyState',
    defaultValue: true,
    componentInstanceContext: RecordBoardComponentInstanceContext,
  });
