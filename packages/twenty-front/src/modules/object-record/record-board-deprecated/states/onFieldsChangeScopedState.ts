import { FieldMetadata } from '@/object-record/field/types/FieldMetadata';
import { BoardFieldDefinition } from '@/object-record/record-board-deprecated/types/BoardFieldDefinition';
import { createStateScopeMap } from '@/ui/utilities/recoil-scope/utils/createStateScopeMap';

export const onFieldsChangeScopedState = createStateScopeMap<
  (fields: BoardFieldDefinition<FieldMetadata>[]) => void
>({
  key: 'onFieldsChangeScopedState',
  defaultValue: () => {},
});
