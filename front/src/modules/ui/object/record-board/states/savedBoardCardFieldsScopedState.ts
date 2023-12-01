import { FieldMetadata } from '@/ui/object/field/types/FieldMetadata';
import { createScopedState } from '@/ui/utilities/recoil-scope/utils/createScopedState';

import { BoardFieldDefinition } from '../types/BoardFieldDefinition';

export const savedBoardCardFieldsScopedState = createScopedState<
  BoardFieldDefinition<FieldMetadata>[]
>({
  key: 'savedBoardCardFieldsScopedState',
  defaultValue: [],
});
