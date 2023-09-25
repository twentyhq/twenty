import { selectorFamily } from 'recoil';

import { FieldMetadata } from '@/ui/field/types/FieldMetadata';
import { ColumnDefinition } from '@/ui/table/types/ColumnDefinition';

import { boardCardFieldsScopedState } from '../boardCardFieldsScopedState';

export const boardCardFieldsByKeyScopedSelector = selectorFamily({
  key: 'boardCardFieldsByKeyScopedSelector',
  get:
    (scopeId: string) =>
    ({ get }) =>
      get(boardCardFieldsScopedState(scopeId)).reduce<
        Record<string, ColumnDefinition<FieldMetadata>>
      >((result, field) => ({ ...result, [field.key]: field }), {}),
});
