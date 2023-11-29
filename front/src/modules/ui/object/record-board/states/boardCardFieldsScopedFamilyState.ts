import { atomFamily } from 'recoil';

import { FieldMetadata } from '@/ui/object/field/types/FieldMetadata';

import { BoardFieldDefinition } from '../types/BoardFieldDefinition';

export const boardCardFieldsScopedFamilyState = atomFamily<
  BoardFieldDefinition<FieldMetadata>[],
  string
>({
  key: 'boardCardFieldsScopedFamilyState',
  default: [],
});
