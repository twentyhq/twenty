import { createContext } from 'react';

import { FieldDefinition } from '../types/FieldDefinition';
import { FieldMetadata } from '../types/FieldMetadata';

export const EditableFieldDefinitionContext = createContext<
  FieldDefinition<FieldMetadata>
>({} as FieldDefinition<FieldMetadata>);
