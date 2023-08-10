import { createContext } from 'react';

import { FieldDefinition } from '../types/FieldDefinition';

type EditableFieldContextValue = {
  entityId: string | null;
  fieldDefinition: FieldDefinition | null;
  mutation: any | null;
};

export const EditableFieldContext =
  createContext<EditableFieldContextValue | null>(null);
