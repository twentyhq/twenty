import { createContext } from 'react';

import { FieldMetadata } from '@/ui/field/types/FieldMetadata';

import type { ColumnDefinition } from '../types/ColumnDefinition';

export const ColumnContext =
  createContext<ColumnDefinition<FieldMetadata> | null>(null);
