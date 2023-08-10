import { createContext } from 'react';

import { FieldDefinition } from '../types/FieldDefinition';
import { ViewFieldMetadata } from '../types/ViewField';

type EditableFieldContextValue = {
  entityId: string;
  fieldDefinition: FieldDefinition<ViewFieldMetadata>;
  mutation: any;
};

export const EditableFieldContext = createContext<EditableFieldContextValue>({
  entityId: '',
  fieldDefinition: {} as FieldDefinition<ViewFieldMetadata>,
  mutation: undefined,
});
