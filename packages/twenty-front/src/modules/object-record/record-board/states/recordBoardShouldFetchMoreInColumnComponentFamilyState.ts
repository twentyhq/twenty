import { RecordBoardComponentInstanceContext } from '@/object-record/record-board/states/contexts/RecordBoardComponentInstanceContext';
import { createComponentFamilyState } from '@/ui/utilities/state/component-state/utils/createComponentFamilyState';

export const recordBoardShouldFetchMoreInColumnComponentFamilyState =
  createComponentFamilyState<boolean, string>({
    key: 'recordBoardShouldFetchMoreInColumnComponentFamilyState',
    defaultValue: false,
    componentInstanceContext: RecordBoardComponentInstanceContext,
  });
