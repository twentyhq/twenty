import { createContext } from 'react';

import { FieldDefinition } from '../types/FieldDefinition';
import { FieldMetadata } from '../types/FieldMetadata';

export type RecordUpdateHookParams = {
  variables: {
    where: Record<string, unknown>;
    updateOneRecordInput: Record<string, unknown>;
  };
};

export type RecordUpdateHookReturn = {
  loading?: boolean;
};

export type RecordUpdateHook = () => [
  (params: RecordUpdateHookParams) => void,
  RecordUpdateHookReturn,
];

export type GenericFieldContextType = {
  fieldDefinition: FieldDefinition<FieldMetadata>;
  useUpdateRecord?: RecordUpdateHook;
  recordId: string;
  recoilScopeId?: string;
  hotkeyScope: string;
  isLabelIdentifier: boolean;
  labelIdentifierLink?: string;
  clearable?: boolean;
  maxWidth?: number;
  isCentered?: boolean;
  overridenIsFieldEmpty?: boolean;
  displayedMaxRows?: number;
  isDisplayModeFixHeight?: boolean;
};

export const FieldContext = createContext<GenericFieldContextType>(
  {} as GenericFieldContextType,
);
