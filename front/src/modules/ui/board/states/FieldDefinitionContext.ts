import { createContext } from 'react';

import { FieldDefinition } from '@/ui/editable-field/types/FieldDefinition';

export const FieldDefinitionContext = createContext<FieldDefinition | null>(
  null,
);
