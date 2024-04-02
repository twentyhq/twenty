import { RecordBoardColumnDefinition } from '@/object-record/record-board/types/RecordBoardColumnDefinition';
import { createComponentFamilyState } from '@/ui/utilities/state/component-state/utils/createComponentFamilyState';

export const recordBoardColumnsComponentFamilyState =
  createComponentFamilyState<RecordBoardColumnDefinition | undefined, string>({
    key: 'recordBoardColumnsComponentFamilyState',
    defaultValue: undefined,
  });
