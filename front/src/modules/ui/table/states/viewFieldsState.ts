import { atom } from 'recoil';

import { ViewFieldDefinition } from '../types/ViewField';

export const viewFieldsFamilyState = atom<ViewFieldDefinition<unknown>[]>({
  key: 'viewFieldsFamilyState',
  default: [],
});
