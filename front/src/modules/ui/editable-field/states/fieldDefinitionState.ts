import { atom } from 'recoil';

import { FieldDefinition } from '../types/FieldDefinition';
import { ViewFieldMetadata } from '../types/ViewField';

export const fieldsDefinitionsState = atom<
  FieldDefinition<ViewFieldMetadata>[]
>({
  key: 'fieldsDefinitionState',
  default: [],
});
