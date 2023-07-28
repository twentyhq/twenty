import { atom } from 'recoil';

import { ViewFieldDefinition } from '../types/ViewField';

export const viewFieldsState = atom<ViewFieldDefinition<unknown>[]>({
  key: 'viewFieldsState',
  default: [],
});
