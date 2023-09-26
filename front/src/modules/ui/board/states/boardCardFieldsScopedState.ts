import { atomFamily } from 'recoil';

import {
  ViewFieldDefinition,
  ViewFieldMetadata,
} from '@/ui/editable-field/types/ViewField';

export const boardCardFieldsScopedState = atomFamily<
  ViewFieldDefinition<ViewFieldMetadata>[],
  string
>({
  key: 'boardCardFieldsScopedState',
  default: [],
});
