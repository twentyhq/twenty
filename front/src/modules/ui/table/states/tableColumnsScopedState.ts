import { atomFamily } from 'recoil';

import type {
  ViewFieldDefinition,
  ViewFieldMetadata,
} from '@/ui/editable-field/types/ViewField';

export const tableColumnsScopedState = atomFamily<
  ViewFieldDefinition<ViewFieldMetadata>[],
  string
>({
  key: 'tableColumnsScopedState',
  default: [],
});
