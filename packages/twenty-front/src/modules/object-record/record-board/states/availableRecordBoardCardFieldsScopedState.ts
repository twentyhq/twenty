import { FieldMetadata } from '@/object-record/field/types/FieldMetadata';
import { createScopedState } from '@/ui/utilities/recoil-scope/utils/createScopedState';

import { BoardFieldDefinition } from '../types/BoardFieldDefinition';

export const availableRecordBoardCardFieldsScopedState = createScopedState<
  BoardFieldDefinition<FieldMetadata>[]
>({
  key: 'availableRecordBoardCardFieldsScopedState',
  defaultValue: [],
});
