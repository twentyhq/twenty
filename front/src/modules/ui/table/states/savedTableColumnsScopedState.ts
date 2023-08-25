import { atomFamily } from 'recoil';

import type {
  ViewFieldDefinition,
  ViewFieldMetadata,
} from '@/ui/editable-field/types/ViewField';

export const savedTableColumnsScopedState = atomFamily<
  ViewFieldDefinition<ViewFieldMetadata>[],
  string | undefined
>({
  key: 'savedTableColumnsScopedState',
  default: [],
});
