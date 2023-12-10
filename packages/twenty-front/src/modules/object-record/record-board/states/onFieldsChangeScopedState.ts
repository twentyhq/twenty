import { FieldMetadata } from '@/object-record/field/types/FieldMetadata';
import { BoardFieldDefinition } from '@/object-record/record-board/types/BoardFieldDefinition';
import { createScopedState } from '@/ui/utilities/recoil-scope/utils/createScopedState';

export const onFieldsChangeScopedState = createScopedState<
  (fields: BoardFieldDefinition<FieldMetadata>[]) => void
>({
  key: 'onFieldsChangeScopedState',
  defaultValue: () => {},
});
