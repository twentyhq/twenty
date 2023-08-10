import { atom } from 'recoil';

import { FieldDefinition } from '../types/FieldDefinition';

export const fieldsDefinitionsState = atom<FieldDefinition[]>({
  key: 'fieldsDefinitionState',
  default: [],
});
