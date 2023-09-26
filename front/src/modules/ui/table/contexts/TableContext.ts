import { createContext } from 'react';

import { ViewFieldMetadata } from '@/ui/editable-field/types/ViewField';

import { ColumnDefinition } from '../types/ColumnDefinition';

export const TableContext = createContext<{
  onColumnsChange?: (
    columns: ColumnDefinition<ViewFieldMetadata>[],
  ) => void | Promise<void>;
}>({});
