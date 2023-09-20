import { useContext } from 'react';

import { isFieldBoolean } from '../../field/types/guards/isFieldBoolean';
import { isFieldDate } from '../../field/types/guards/isFieldDate';
import { isFieldNumber } from '../../field/types/guards/isFieldNumber';
import { isFieldPhone } from '../../field/types/guards/isFieldPhone';
import { isFieldProbability } from '../../field/types/guards/isFieldProbability';
import { isFieldRelation } from '../../field/types/guards/isFieldRelation';
import { isFieldText } from '../../field/types/guards/isFieldText';
import { isFieldURL } from '../../field/types/guards/isFieldURL';
import { EditableFieldDefinitionContext } from '../contexts/EditableFieldDefinitionContext';

import { GenericEditableBooleanField } from './GenericEditableBooleanField';
import { GenericEditableDateField } from './GenericEditableDateField';
import { GenericEditableNumberField } from './GenericEditableNumberField';
import { GenericEditablePhoneField } from './GenericEditablePhoneField';
import { GenericEditableRelationField } from './GenericEditableRelationField';
import { GenericEditableTextField } from './GenericEditableTextField';
import { GenericEditableURLField } from './GenericEditableURLField';
import { ProbabilityEditableField } from './ProbabilityEditableField';

export const GenericEditableField = () => {
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
  } else if (isFieldPhone(fieldDefinition)) {
    return <GenericEditablePhoneField />;
  } else if (isFieldBoolean(fieldDefinition)) {
    return <GenericEditableBooleanField />;
  } else {
    console.warn(
      `Unknown field metadata type: ${fieldDefinition.type} in GenericEditableField`,
    );
    return <></>;
  }
};
