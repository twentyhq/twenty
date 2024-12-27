import { RecordBoardComponentInstanceContext } from '@/object-record/record-board/states/contexts/RecordBoardComponentInstanceContext';
import { RecordBoardFieldDefinition } from '@/object-record/record-board/types/RecordBoardFieldDefinition';
import { FieldMetadata } from '@/object-record/record-field/types/FieldMetadata';
import { createComponentStateV2 } from '@/ui/utilities/state/component-state/utils/createComponentStateV2';

export const recordBoardFieldDefinitionsComponentState = createComponentStateV2<
  RecordBoardFieldDefinition<FieldMetadata>[]
>({
  key: 'recordBoardFieldDefinitionsComponentState',
  defaultValue: [],
  componentInstanceContext: RecordBoardComponentInstanceContext,
});
