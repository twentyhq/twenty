import { useContext } from 'react';

import { EditableFieldContext } from '../states/EditableFieldContext';

import { GenericEditableDateField } from './GenericEditableDateField';
import { GenericEditableNumberField } from './GenericEditableNumberField';
import { GenericEditableRelationField } from './GenericEditableRelationField';
import { ProbabilityEditableField } from './ProbabilityEditableField';

export function GenericEditableField() {
  const currentEditableField = useContext(EditableFieldContext);
  const fieldDefinition = currentEditableField.fieldDefinition;

  switch (fieldDefinition.type) {
    case 'date':
      return <GenericEditableDateField />;
    case 'number':
      return <GenericEditableNumberField />;
    case 'probability':
      return <ProbabilityEditableField />;
    case 'relation':
      return <GenericEditableRelationField />;
    default:
      console.warn(
        `Unknown field metadata type: ${fieldDefinition.type} in GenericEditableField`,
      );
      return <></>;
  }
}
