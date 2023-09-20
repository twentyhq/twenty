import { atomFamily } from 'recoil';

import { FieldMetadata } from '@/ui/field/types/FieldMetadata';
import { ViewFieldDefinition } from '@/views/types/ViewFieldDefinition';

export const boardCardFieldsScopedState = atomFamily<
  ViewFieldDefinition<FieldMetadata>[],
  string
>({
  key: 'boardCardFieldsScopedState',
  default: [],
});
