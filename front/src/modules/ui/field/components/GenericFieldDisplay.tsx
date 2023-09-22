import { useContext } from 'react';

import { FieldContext } from '../contexts/FieldContext';
import { DateFieldDisplay } from '../display/components/DateFieldDisplay';
import { RelationFieldDisplay } from '../display/components/RelationFieldDisplay';
import { TextFieldDisplay } from '../display/components/TextFieldDisplay';
import { isFieldDate } from '../types/guards/isFieldDate';
import { isFieldRelation } from '../types/guards/isFieldRelation';
import { isFieldText } from '../types/guards/isFieldText';

export const GenericFieldDisplay = () => {
  const { fieldDefinition } = useContext(FieldContext);

  return (
    <>
      {isFieldRelation(fieldDefinition) ? (
        <RelationFieldDisplay />
      ) : isFieldText(fieldDefinition) ? (
        <TextFieldDisplay />
      ) : isFieldDate(fieldDefinition) ? (
        <DateFieldDisplay />
      ) : (
        <></>
      )}
    </>
  );
};
