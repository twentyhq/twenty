import { atomFamily } from 'recoil';

import { FieldMetadata } from '@/ui/field/types/FieldMetadata';

import type { ViewFieldDefinition } from '../../../views/types/ViewFieldDefinition';

export const savedTableColumnsFamilyState = atomFamily<
  ViewFieldDefinition<FieldMetadata>[],
  string | undefined
>({
  key: 'savedTableColumnsFamilyState',
  default: [],
});
