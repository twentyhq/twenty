import { FieldMetadata } from '@/object-record/field/types/FieldMetadata';
import { createScopedState } from '@/ui/utilities/recoil-scope/utils/createScopedState';

import { BoardFieldDefinition } from '../types/BoardFieldDefinition';

export const recordBoardCardFieldsScopedState = createScopedState<
  BoardFieldDefinition<FieldMetadata>[]
>({
  key: 'recordBoardCardFieldsScopedState',
  defaultValue: [],
});
