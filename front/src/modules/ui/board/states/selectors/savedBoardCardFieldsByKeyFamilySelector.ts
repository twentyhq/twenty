import { selectorFamily } from 'recoil';

import { FieldMetadata } from '@/ui/field/types/FieldMetadata';
import { ViewFieldDefinition } from '@/views/types/ViewFieldDefinition';

import { savedBoardCardFieldsFamilyState } from '../savedBoardCardFieldsFamilyState';

export const savedBoardCardFieldsByKeyFamilySelector = selectorFamily({
  key: 'savedBoardCardFieldsByKeyFamilySelector',
  get:
    (viewId: string | undefined) =>
    ({ get }) =>
      get(savedBoardCardFieldsFamilyState(viewId)).reduce<
        Record<string, ViewFieldDefinition<FieldMetadata>>
      >((result, field) => ({ ...result, [field.key]: field }), {}),
});
