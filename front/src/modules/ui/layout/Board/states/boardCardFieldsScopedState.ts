import { atomFamily } from 'recoil';

import { FieldMetadata } from '@/ui/Data/Field/types/FieldMetadata';

import { BoardFieldDefinition } from '../types/BoardFieldDefinition';

export const boardCardFieldsScopedState = atomFamily<
  BoardFieldDefinition<FieldMetadata>[],
  string
>({
  key: 'boardCardFieldsScopedState',
  default: [],
});
