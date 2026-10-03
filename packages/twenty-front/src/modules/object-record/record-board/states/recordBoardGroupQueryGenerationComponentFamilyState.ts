import { RecordBoardComponentInstanceContext } from '@/object-record/record-board/states/contexts/RecordBoardComponentInstanceContext';
import { createAtomComponentFamilyState } from '@/ui/utilities/state/jotai/utils/createAtomComponentFamilyState';

export const recordBoardGroupQueryGenerationComponentFamilyState =
  createAtomComponentFamilyState<number, string>({
    key: 'recordBoardGroupQueryGenerationComponentFamilyState',
    defaultValue: 0,
    componentInstanceContext: RecordBoardComponentInstanceContext,
  });
