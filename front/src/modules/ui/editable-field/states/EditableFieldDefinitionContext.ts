import { createContext } from 'react';

import { FieldDefinition } from '../types/FieldDefinition';
import { ViewFieldMetadata } from '../types/ViewField';

export const EditableFieldDefinitionContext = createContext<
  FieldDefinition<ViewFieldMetadata>
>({} as FieldDefinition<ViewFieldMetadata>);
