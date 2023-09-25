import { useContext } from 'react';

import { FieldContext } from '../contexts/FieldContext';
import { DateFieldDisplay } from '../meta-types/display/components/DateFieldDisplay';
import { NumberFieldDisplay } from '../meta-types/display/components/NumberFieldDisplay';
import { PhoneFieldDisplay } from '../meta-types/display/components/PhoneFieldDisplay';
import { RelationFieldDisplay } from '../meta-types/display/components/RelationFieldDisplay';
import { TextFieldDisplay } from '../meta-types/display/components/TextFieldDisplay';
import { URLFieldDisplay } from '../meta-types/display/components/URLFieldDisplay';
import { isFieldDate } from '../types/guards/isFieldDate';
import { isFieldNumber } from '../types/guards/isFieldNumber';
import { isFieldPhone } from '../types/guards/isFieldPhone';
import { isFieldRelation } from '../types/guards/isFieldRelation';
import { isFieldText } from '../types/guards/isFieldText';
import { isFieldURL } from '../types/guards/isFieldURL';

export const FieldDisplay = () => {
  const { fieldDefinition } = useContext(FieldContext);

  return (
    <>
      {isFieldRelation(fieldDefinition) ? (
        <RelationFieldDisplay />
      ) : isFieldText(fieldDefinition) ? (
        <TextFieldDisplay />
      ) : isFieldDate(fieldDefinition) ? (
        <DateFieldDisplay />
      ) : isFieldNumber(fieldDefinition) ? (
        <NumberFieldDisplay />
      ) : isFieldURL(fieldDefinition) ? (
        <URLFieldDisplay />
      ) : isFieldPhone(fieldDefinition) ? (
        <PhoneFieldDisplay />
      ) : (
        <></>
      )}
    </>
  );
};
