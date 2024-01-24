import { FieldMetadata } from '@/object-record/field/types/FieldMetadata';
import { createStateScopeMap } from '@/ui/utilities/recoil-scope/utils/createStateScopeMap';

import { BoardFieldDefinition } from '../types/BoardFieldDefinition';

export const savedRecordBoardDeprecatedCardFieldsScopedState =
  createStateScopeMap<BoardFieldDefinition<FieldMetadata>[]>({
    key: 'savedRecordBoardDeprecatedCardFieldsScopedState',
    defaultValue: [],
  });
