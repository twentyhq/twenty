import { createContext } from 'react';

import { FieldMetadata } from '@/ui/field/types/FieldMetadata';

import type { ViewFieldDefinition } from '../../../views/types/ViewFieldDefinition';

export const ColumnContext =
  createContext<ViewFieldDefinition<FieldMetadata> | null>(null);
