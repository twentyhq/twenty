import { FieldMetadata } from '@/object-record/field/types/FieldMetadata';
import { RecordBoardFieldDefinition } from '@/object-record/record-board/types/RecordBoardFieldDefinition';
import { createStateScopeMap } from '@/ui/utilities/recoil-scope/utils/createStateScopeMap';

export const recordBoardFieldDefinitionsStateScopeMap = createStateScopeMap<
  RecordBoardFieldDefinition<FieldMetadata>[]
>({
  key: 'recordBoardFieldDefinitionsStateScopeMap',
  defaultValue: [],
});
