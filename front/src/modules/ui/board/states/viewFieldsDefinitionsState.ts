import { atom } from 'recoil';

import type {
  ViewFieldDefinition,
  ViewFieldMetadata,
} from '../../editable-field/types/ViewField';

export const viewFieldsDefinitionsState = atom<
  ViewFieldDefinition<ViewFieldMetadata>[]
>({
  key: 'viewFieldsDefinitionState',
  default: [],
});
