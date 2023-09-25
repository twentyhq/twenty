import { createContext } from 'react';

import type { ViewFieldMetadata } from '@/ui/editable-field/types/ViewField';

import type { ColumnDefinition } from '../types/ColumnDefinition';

export const TableContext = createContext<{
  onColumnsChange?: (
    columns: ColumnDefinition<ViewFieldMetadata>[],
  ) => void | Promise<void>;
}>({});
