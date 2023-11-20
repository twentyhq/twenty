import { createContext } from 'react';

import { FieldDefinition } from '../types/FieldDefinition';
import { FieldMetadata } from '../types/FieldMetadata';

export type GenericFieldContextType = {
  fieldDefinition: FieldDefinition<FieldMetadata>;
  // TODO: add better typing for mutation web-hook
  useUpdateEntityMutation?: () => [(params: any) => void, any];
  entityId: string;
  recoilScopeId?: string;
  hotkeyScope: string;
  isMainIdentifier: boolean;
  mainIdentifierMapper?: (record: any) => {
    name: string;
    avatarUrl?: string;
    avatarType: string;
  };
  basePathToShowPage?: string;
};

export const FieldContext = createContext<GenericFieldContextType>(
  {} as GenericFieldContextType,
);
