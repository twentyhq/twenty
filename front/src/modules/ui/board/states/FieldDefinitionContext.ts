import { createContext } from 'react';

import { FieldDefinition } from '@/ui/editable-field/types/FieldDefinition';
import {
  FieldMetadata,
  FieldType,
} from '@/ui/editable-field/types/FieldMetadata';

export const FieldDefinitionContext = createContext<
  FieldDefinition<FieldMetadata>
>({
  id: '',
  label: '',
  icon: undefined,
  type: 'unknown' satisfies FieldType,
  metadata: {} as FieldMetadata,
});
