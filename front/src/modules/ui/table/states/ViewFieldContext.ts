import { createContext } from 'react';

import { ViewFieldDefinition, ViewFieldMetadata } from '../types/ViewField';

export const ViewFieldContext =
  createContext<ViewFieldDefinition<ViewFieldMetadata> | null>(null);
