import { atom } from 'recoil';

import type {
  ViewFieldDefinition,
  ViewFieldMetadata,
} from '../../editable-field/types/ViewField';

export const fieldsDefinitionsState = atom<
  ViewFieldDefinition<ViewFieldMetadata>[]
>({
  key: 'fieldsDefinitionState',
  default: [],
});
