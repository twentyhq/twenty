import { selectorFamily } from 'recoil';

import { FieldMetadata } from '@/ui/field/types/FieldMetadata';

import { BoardFieldDefinition } from '../../types/BoardFieldDefinition';
import { savedBoardCardFieldsFamilyState } from '../savedBoardCardFieldsFamilyState';

export const savedBoardCardFieldsByKeyFamilySelector = selectorFamily({
  key: 'savedBoardCardFieldsByKeyFamilySelector',
  get:
    (viewId: string | undefined) =>
    ({ get }) =>
      get(savedBoardCardFieldsFamilyState(viewId)).reduce<
        Record<string, BoardFieldDefinition<FieldMetadata>>
      >((result, field) => ({ ...result, [field.key]: field }), {}),
});
