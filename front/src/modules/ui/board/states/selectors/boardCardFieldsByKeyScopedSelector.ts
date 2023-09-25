import { selectorFamily } from 'recoil';

import {
  ViewFieldDefinition,
  ViewFieldMetadata,
} from '@/ui/editable-field/types/ViewField';

import { boardCardFieldsScopedState } from '../boardCardFieldsScopedState';

export const boardCardFieldsByKeyScopedSelector = selectorFamily({
  key: 'boardCardFieldsByKeyScopedSelector',
  get:
    (scopeId: string) =>
    ({ get }) =>
      get(boardCardFieldsScopedState(scopeId)).reduce<
        Record<string, ViewFieldDefinition<ViewFieldMetadata>>
      >((result, field) => ({ ...result, [field.key]: field }), {}),
});
