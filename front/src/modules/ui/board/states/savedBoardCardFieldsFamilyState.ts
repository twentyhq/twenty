import { atomFamily } from 'recoil';

import { FieldMetadata } from '@/ui/field/types/FieldMetadata';
import { ViewFieldDefinition } from '@/views/types/ViewFieldDefinition';

export const savedBoardCardFieldsFamilyState = atomFamily<
  ViewFieldDefinition<FieldMetadata>[],
  string | undefined
>({
  key: 'savedBoardCardFieldsFamilyState',
  default: [],
});
