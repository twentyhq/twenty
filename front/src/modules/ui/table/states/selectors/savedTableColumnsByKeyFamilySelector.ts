import { selectorFamily } from 'recoil';

import { FieldMetadata } from '@/ui/field/types/FieldMetadata';

import { ViewFieldDefinition } from '../../../../views/types/ViewFieldDefinition';
import { savedTableColumnsFamilyState } from '../savedTableColumnsFamilyState';

export const savedTableColumnsByKeyFamilySelector = selectorFamily({
  key: 'savedTableColumnsByKeyFamilySelector',
  get:
    (viewId: string | undefined) =>
    ({ get }) =>
      get(savedTableColumnsFamilyState(viewId)).reduce<
        Record<string, ViewFieldDefinition<FieldMetadata>>
      >((result, column) => ({ ...result, [column.key]: column }), {}),
});
