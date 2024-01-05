import { FieldMetadata } from '@/object-record/field/types/FieldMetadata';
import { createStateScopeMap } from '@/ui/utilities/recoil-scope/utils/createStateScopeMap';

import { BoardFieldDefinition } from '../types/BoardFieldDefinition';

export const savedRecordBoardCardFieldsScopedState = createStateScopeMap<
  BoardFieldDefinition<FieldMetadata>[]
>({
  key: 'savedRecordBoardCardFieldsScopedState',
  defaultValue: [],
});
