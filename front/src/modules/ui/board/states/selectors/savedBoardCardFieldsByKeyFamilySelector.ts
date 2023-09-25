import { selectorFamily } from 'recoil';

import { FieldMetadata } from '@/ui/field/types/FieldMetadata';
import { ColumnDefinition } from '@/ui/table/types/ColumnDefinition';

import { savedBoardCardFieldsFamilyState } from '../savedBoardCardFieldsFamilyState';

export const savedBoardCardFieldsByKeyFamilySelector = selectorFamily({
  key: 'savedBoardCardFieldsByKeyFamilySelector',
  get:
    (viewId: string | undefined) =>
    ({ get }) =>
      get(savedBoardCardFieldsFamilyState(viewId)).reduce<
        Record<string, ColumnDefinition<FieldMetadata>>
      >((result, field) => ({ ...result, [field.key]: field }), {}),
});
