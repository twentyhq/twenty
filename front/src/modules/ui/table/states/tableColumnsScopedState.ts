import { atomFamily } from 'recoil';

import { FieldMetadata } from '@/ui/field/types/FieldMetadata';

import type { ViewFieldDefinition } from '../../../views/types/ViewFieldDefinition';

export const tableColumnsScopedState = atomFamily<
  ViewFieldDefinition<FieldMetadata>[],
  string
>({
  key: 'tableColumnsScopedState',
  default: [],
});
