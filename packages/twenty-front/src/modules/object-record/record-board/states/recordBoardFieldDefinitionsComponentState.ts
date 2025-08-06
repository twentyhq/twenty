import { RecordBoardComponentInstanceContext } from '@/object-record/record-board/states/contexts/RecordBoardComponentInstanceContext';
import { RecordBoardFieldDefinition } from '@/object-record/record-board/types/RecordBoardFieldDefinition';
import { FieldMetadata } from '@/object-record/record-field/types/FieldMetadata';
import { createComponentState } from '@/ui/utilities/state/component-state/utils/createComponentState';

export const recordBoardFieldDefinitionsComponentState = createComponentState<
  RecordBoardFieldDefinition<FieldMetadata>[]
>({
  key: 'recordBoardFieldDefinitionsComponentState',
  defaultValue: [],
  componentInstanceContext: RecordBoardComponentInstanceContext,
});
