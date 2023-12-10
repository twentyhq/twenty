import { createContext } from 'react';

import { FieldMetadata } from '@/object-record/field/types/FieldMetadata';

import { ColumnDefinition } from '../types/ColumnDefinition';

export const ColumnContext =
  createContext<ColumnDefinition<FieldMetadata> | null>(null);
