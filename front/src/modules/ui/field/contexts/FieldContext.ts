import { createContext } from 'react';

import { FieldDefinition } from '../types/FieldDefinition';
import { FieldMetadata } from '../types/FieldMetadata';

type GenericFieldContextType = {
  fieldDefinition: FieldDefinition<FieldMetadata>;
  updateEntityMutation: any;
  entityId: string;
  recoilScopeId: string;
};

export const FieldContext = createContext<GenericFieldContextType>(
  {} as GenericFieldContextType,
);
