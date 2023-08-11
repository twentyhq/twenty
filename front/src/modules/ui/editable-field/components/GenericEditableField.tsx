import { useContext } from 'react';

import { EditableFieldDefinitionContext } from '../states/EditableFieldDefinitionContext';
import { isFieldDate } from '../types/guards/isFieldDate';
import { isFieldNumber } from '../types/guards/isFieldNumber';
import { isFieldProbability } from '../types/guards/isFieldProbability';
import { isFieldRelation } from '../types/guards/isFieldRelation';
import { isFieldText } from '../types/guards/isFieldText';
import { isFieldURL } from '../types/guards/isFieldURL';

import { GenericEditableDateField } from './GenericEditableDateField';
import { GenericEditableNumberField } from './GenericEditableNumberField';
import { GenericEditableRelationField } from './GenericEditableRelationField';
import { GenericEditableTextField } from './GenericEditableTextField';
import { GenericEditableURLField } from './GenericEditableURLField';
import { ProbabilityEditableField } from './ProbabilityEditableField';

export function GenericEditableField() {
  const fieldDefinition = useContext(EditableFieldDefinitionContext);

  if (isFieldRelation(fieldDefinition)) {
    return <GenericEditableRelationField />;
  } else if (isFieldDate(fieldDefinition)) {
    return <GenericEditableDateField />;
  } else if (isFieldNumber(fieldDefinition)) {
    return <GenericEditableNumberField />;
  } else if (isFieldProbability(fieldDefinition)) {
    return <ProbabilityEditableField />;
  } else if (isFieldURL(fieldDefinition)) {
    return <GenericEditableURLField />;
  } else if (isFieldText(fieldDefinition)) {
    return <GenericEditableTextField />;
  } else {
    console.warn(
      `Unknown field metadata type: ${fieldDefinition.type} in GenericEditableField`,
    );
    return <></>;
  }
}
