import { selectorFamily } from 'recoil';

import { FieldMetadata } from '@/object-record/field/types/FieldMetadata';

import { BoardFieldDefinition } from '../../types/BoardFieldDefinition';
import { recordBoardCardFieldsScopedState } from '../recordBoardDeprecatedCardFieldsScopedState';

export const recordBoardCardFieldsByKeyScopedSelector = selectorFamily({
  key: 'recordBoardCardFieldsByKeyScopedSelector',
  get:
    (scopeId: string) =>
    ({ get }) =>
      get(recordBoardCardFieldsScopedState({ scopeId })).reduce<
        Record<string, BoardFieldDefinition<FieldMetadata>>
      >((result, field) => ({ ...result, [field.fieldMetadataId]: field }), {}),
});
