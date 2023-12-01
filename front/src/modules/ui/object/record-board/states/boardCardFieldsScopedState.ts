import { FieldMetadata } from '@/ui/object/field/types/FieldMetadata';
import { createScopedState } from '@/ui/utilities/recoil-scope/utils/createScopedState';

import { BoardFieldDefinition } from '../types/BoardFieldDefinition';

export const boardCardFieldsScopedState = createScopedState<
  BoardFieldDefinition<FieldMetadata>[]
>({
  key: 'boardCardFieldsScopedState',
  defaultValue: [],
});
