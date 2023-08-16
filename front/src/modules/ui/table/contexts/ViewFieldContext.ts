import { createContext } from 'react';

import {
  ViewFieldDefinition,
  ViewFieldMetadata,
} from '../../editable-field/types/ViewField';

export const ViewFieldContext =
  createContext<ViewFieldDefinition<ViewFieldMetadata> | null>(null);
