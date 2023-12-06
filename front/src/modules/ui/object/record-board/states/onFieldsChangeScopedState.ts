import { FieldMetadata } from '@/ui/object/field/types/FieldMetadata';
import { BoardFieldDefinition } from '@/ui/object/record-board/types/BoardFieldDefinition';
import { createScopedState } from '@/ui/utilities/recoil-scope/utils/createScopedState';

export const onFieldsChangeScopedState = createScopedState<
  (fields: BoardFieldDefinition<FieldMetadata>[]) => void
>({
  key: 'onFieldsChangeScopedState',
  defaultValue: () => {},
});
