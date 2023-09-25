import { atomFamily } from 'recoil';

import { FieldMetadata } from '@/ui/field/types/FieldMetadata';
import { ColumnDefinition } from '@/ui/table/types/ColumnDefinition';

export const savedBoardCardFieldsFamilyState = atomFamily<
  ColumnDefinition<FieldMetadata>[],
  string | undefined
>({
  key: 'savedBoardCardFieldsFamilyState',
  default: [],
});
