import { selectorFamily } from 'recoil';

import {
  ViewFieldDefinition,
  ViewFieldMetadata,
} from '@/ui/editable-field/types/ViewField';

import { savedBoardCardFieldsFamilyState } from '../savedBoardCardFieldsFamilyState';

export const savedBoardCardFieldsByKeyFamilySelector = selectorFamily({
  key: 'savedBoardCardFieldsByKeyFamilySelector',
  get:
    (viewId: string | undefined) =>
    ({ get }) =>
      get(savedBoardCardFieldsFamilyState(viewId)).reduce<
        Record<string, ViewFieldDefinition<ViewFieldMetadata>>
      >((result, field) => ({ ...result, [field.key]: field }), {}),
});
