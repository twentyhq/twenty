import { atomFamily } from 'recoil';

import { FieldMetadata } from '@/ui/field/types/FieldMetadata';
import { ViewFieldDefinition } from '@/views/types/ViewFieldDefinition';

export const availableBoardCardFieldsScopedState = atomFamily<
  ViewFieldDefinition<FieldMetadata>[],
  string
>({
  key: 'availableBoardCardFieldsScopedState',
  default: [],
});
