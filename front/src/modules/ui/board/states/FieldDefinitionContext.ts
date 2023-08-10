import { createContext } from 'react';

import { FieldDefinition } from '@/ui/editable-field/types/FieldDefinition';
import { FieldMetadata } from '@/ui/editable-field/types/FieldMetadata';

export const FieldDefinitionContext = createContext<
  FieldDefinition<FieldMetadata>
>({
  id: '',
  label: '',
  icon: undefined,
  type: '',
  metadata: {} as FieldMetadata,
});
