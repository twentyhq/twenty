import { useContext } from 'react';

import { EditableFieldContext } from '../states/EditableFieldContext';
import { isFieldDate } from '../types/guards/isFieldDate';
import { isFieldNumber } from '../types/guards/isFieldNumber';
import { isFieldProbability } from '../types/guards/isFieldProbability';
import { isFieldRelation } from '../types/guards/isFieldRelation';

import { GenericEditableDateField } from './GenericEditableDateField';
import { GenericEditableNumberField } from './GenericEditableNumberField';
import { GenericEditableRelationField } from './GenericEditableRelationField';
import { ProbabilityEditableField } from './ProbabilityEditableField';

export function GenericEditableField() {
  const currentEditableField = useContext(EditableFieldContext);
  const fieldDefinition = currentEditableField.fieldDefinition;

  if (isFieldRelation(fieldDefinition)) {
    return <GenericEditableRelationField />;
  } else if (isFieldDate(fieldDefinition)) {
    return <GenericEditableDateField />;
  } else if (isFieldNumber(fieldDefinition)) {
    return <GenericEditableNumberField />;
  } else if (isFieldProbability(fieldDefinition)) {
    return <ProbabilityEditableField />;
  } else {
    console.warn(
      `Unknown field metadata type: ${fieldDefinition.metadata.type} in GenericEditableCell`,
    );
    return <></>;
  }
}
