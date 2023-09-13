import { atomFamily } from 'recoil';

import type {
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
