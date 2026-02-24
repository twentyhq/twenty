import { RecordBoardComponentInstanceContext } from '@/object-record/record-board/states/contexts/RecordBoardComponentInstanceContext';
import { createComponentFamilyStateV2 } from '@/ui/utilities/state/jotai/utils/createComponentFamilyStateV2';

export const recordBoardShouldFetchMoreInColumnComponentFamilyState =
  createComponentFamilyStateV2<boolean, string>({
    key: 'recordBoardShouldFetchMoreInColumnComponentFamilyState',
    defaultValue: true,
    componentInstanceContext: RecordBoardComponentInstanceContext,
  });
