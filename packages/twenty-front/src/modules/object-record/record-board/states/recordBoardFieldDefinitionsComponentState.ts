import { createComponentState } from 'twenty-ui';

import { RecordBoardFieldDefinition } from '@/object-record/record-board/types/RecordBoardFieldDefinition';
import { FieldMetadata } from '@/object-record/record-field/types/FieldMetadata';

export const recordBoardFieldDefinitionsComponentState = createComponentState<
  RecordBoardFieldDefinition<FieldMetadata>[]
>({
  key: 'recordBoardFieldDefinitionsComponentState',
  defaultValue: [],
});
