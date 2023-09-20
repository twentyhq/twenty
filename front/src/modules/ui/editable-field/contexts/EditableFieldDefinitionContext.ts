import { createContext } from 'react';

import { FieldDefinition } from '../../field/types/FieldDefinition';
import { FieldMetadata } from '../../field/types/FieldMetadata';

export const EditableFieldDefinitionContext = createContext<
  FieldDefinition<FieldMetadata>
>({} as FieldDefinition<FieldMetadata>);
