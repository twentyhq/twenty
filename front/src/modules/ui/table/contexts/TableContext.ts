import { createContext } from 'react';

import { FieldMetadata } from '@/ui/field/types/FieldMetadata';

import type { ColumnDefinition } from '../types/ColumnDefinition';

export const TableContext = createContext<{
  onColumnsChange?: (
    columns: ColumnDefinition<FieldMetadata>[],
  ) => void | Promise<void>;
}>({});
