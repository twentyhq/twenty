import { createContext } from 'react';

import {
  ViewFieldDefinition,
  ViewFieldMetadata,
} from '../../editable-field/types/ViewField';

export const FieldDefinitionContext =
  createContext<ViewFieldDefinition<ViewFieldMetadata> | null>(null);
