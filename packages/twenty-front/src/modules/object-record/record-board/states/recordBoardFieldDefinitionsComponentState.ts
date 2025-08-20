import { RecordBoardComponentInstanceContext } from '@/object-record/record-board/states/contexts/RecordBoardComponentInstanceContext';
import { type RecordBoardFieldDefinition } from '@/object-record/record-board/types/RecordBoardFieldDefinition';
import { type FieldMetadata } from '@/object-record/record-field/ui/types/FieldMetadata';
import { createComponentState } from '@/ui/utilities/state/component-state/utils/createComponentState';

export const recordBoardFieldDefinitionsComponentState = createComponentState<
  RecordBoardFieldDefinition<FieldMetadata>[]
>({
  key: 'recordBoardFieldDefinitionsComponentState',
  defaultValue: [],
  componentInstanceContext: RecordBoardComponentInstanceContext,
});
