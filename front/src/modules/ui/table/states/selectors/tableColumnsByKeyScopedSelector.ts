import { selectorFamily } from 'recoil';

import { FieldMetadata } from '@/ui/field/types/FieldMetadata';

import type { ViewFieldDefinition } from '../../../../views/types/ViewFieldDefinition';
import { tableColumnsScopedState } from '../tableColumnsScopedState';

export const tableColumnsByKeyScopedSelector = selectorFamily({
  key: 'tableColumnsByKeyScopedSelector',
  get:
    (scopeId: string) =>
    ({ get }) =>
      get(tableColumnsScopedState(scopeId)).reduce<
        Record<string, ViewFieldDefinition<FieldMetadata>>
      >((result, column) => ({ ...result, [column.key]: column }), {}),
});
