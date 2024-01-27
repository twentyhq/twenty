import { RecordBoardColumnDefinition } from '@/object-record/record-board/types/RecordBoardColumnDefinition';
import { createFamilyStateScopeMap } from '@/ui/utilities/recoil-scope/utils/createFamilyStateScopeMap';

export const recordBoardColumnsFamilyStateScopeMap = createFamilyStateScopeMap<
  RecordBoardColumnDefinition | undefined,
  string
>({
  key: 'recordBoardColumnsFamilyStateScopeMap',
  defaultValue: undefined,
});
