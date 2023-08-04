import { atom } from 'recoil';

import { ViewFieldDefinition, ViewFieldMetadata } from '../types/ViewField';

export const viewFieldsState = atom<ViewFieldDefinition<ViewFieldMetadata>[]>({
  key: 'viewFieldsState',
  default: [],
});
