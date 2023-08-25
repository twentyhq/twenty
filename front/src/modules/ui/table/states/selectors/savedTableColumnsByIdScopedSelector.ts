import { selectorFamily } from 'recoil';

import type {
  ViewFieldDefinition,
  ViewFieldMetadata,
} from '@/ui/editable-field/types/ViewField';

import { savedTableColumnsScopedState } from '../savedTableColumnsScopedState';

export const savedTableColumnsByIdScopedSelector = selectorFamily({
  key: 'savedTableColumnsByIdScopedSelector',
  get:
    (viewId: string | undefined) =>
    ({ get }) =>
      get(savedTableColumnsScopedState(viewId)).reduce<
        Record<string, ViewFieldDefinition<ViewFieldMetadata>>
      >((result, column) => ({ ...result, [column.id]: column }), {}),
});
