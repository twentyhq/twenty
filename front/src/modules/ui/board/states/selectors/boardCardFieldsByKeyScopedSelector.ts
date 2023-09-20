import { selectorFamily } from 'recoil';

import { FieldMetadata } from '@/ui/field/types/FieldMetadata';
import { ViewFieldDefinition } from '@/views/types/ViewFieldDefinition';

import { boardCardFieldsScopedState } from '../boardCardFieldsScopedState';

export const boardCardFieldsByKeyScopedSelector = selectorFamily({
  key: 'boardCardFieldsByKeyScopedSelector',
  get:
    (scopeId: string) =>
    ({ get }) =>
      get(boardCardFieldsScopedState(scopeId)).reduce<
        Record<string, ViewFieldDefinition<FieldMetadata>>
      >((result, field) => ({ ...result, [field.key]: field }), {}),
});
