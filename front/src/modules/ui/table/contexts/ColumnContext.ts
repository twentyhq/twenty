import { createContext } from 'react';

import { ViewFieldMetadata } from '@/ui/editable-field/types/ViewField';

import { type ColumnDefinition } from '../types/ColumnDefinition';

export const ColumnContext =
  createContext<ColumnDefinition<ViewFieldMetadata> | null>(null);
