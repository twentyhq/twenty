import { FieldMetadata } from '@/object-record/field/types/FieldMetadata';
import { createScopedState } from '@/ui/utilities/recoil-scope/utils/createScopedState';

import { BoardFieldDefinition } from '../types/BoardFieldDefinition';

export const savedRecordBoardCardFieldsScopedState = createScopedState<
  BoardFieldDefinition<FieldMetadata>[]
>({
  key: 'savedRecordBoardCardFieldsScopedState',
  defaultValue: [],
});
