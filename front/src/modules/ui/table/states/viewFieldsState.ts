import { atom } from 'recoil';

import { ViewFieldDefinition, ViewFieldMetadata } from '../types/ViewField';

export const viewFieldsFamilyState = atom<
  ViewFieldDefinition<ViewFieldMetadata>[]
>({
  key: 'viewFieldsFamilyState',
  default: [],
});
