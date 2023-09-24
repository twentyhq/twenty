import { atomFamily } from 'recoil';

import {
  type ViewFieldDefinition,
  type ViewFieldMetadata,
} from '@/ui/editable-field/types/ViewField';

export const availableBoardCardFieldsScopedState = atomFamily<
  ViewFieldDefinition<ViewFieldMetadata>[],
  string
>({
  key: 'availableBoardCardFieldsScopedState',
  default: [],
});
