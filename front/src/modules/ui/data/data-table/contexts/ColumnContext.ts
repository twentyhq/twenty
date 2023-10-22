import { createContext } from 'react';

import { FieldMetadata } from '@/ui/data/field/types/FieldMetadata';

import { ColumnDefinition } from '../types/ColumnDefinition';

export const ColumnContext =
  createContext<ColumnDefinition<FieldMetadata> | null>(null);
