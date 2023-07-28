import { createContext } from 'react';

import { ViewFieldDefinition } from '../types/ViewField';

export const ViewFieldContext =
  createContext<ViewFieldDefinition<unknown> | null>(null);
