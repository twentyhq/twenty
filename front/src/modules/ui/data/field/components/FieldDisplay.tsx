import { useContext } from 'react';

import { FieldContext } from '../contexts/FieldContext';
import { ChipFieldDisplay } from '../meta-types/display/components/ChipFieldDisplay';
import { DateFieldDisplay } from '../meta-types/display/components/DateFieldDisplay';
import { DoubleTextChipFieldDisplay } from '../meta-types/display/components/DoubleTextChipFieldDisplay';
import { DoubleTextFieldDisplay } from '../meta-types/display/components/DoubleTextFieldDisplay';
import { EmailFieldDisplay } from '../meta-types/display/components/EmailFieldDisplay';
import { MoneyAmountV2FieldDisplay } from '../meta-types/display/components/MoneyAmountV2FieldDisplay';
import { MoneyFieldDisplay } from '../meta-types/display/components/MoneyFieldDisplay';
import { NumberFieldDisplay } from '../meta-types/display/components/NumberFieldDisplay';
import { PhoneFieldDisplay } from '../meta-types/display/components/PhoneFieldDisplay';
import { RelationFieldDisplay } from '../meta-types/display/components/RelationFieldDisplay';
import { TextFieldDisplay } from '../meta-types/display/components/TextFieldDisplay';
import { URLFieldDisplay } from '../meta-types/display/components/URLFieldDisplay';
import { URLV2FieldDisplay } from '../meta-types/display/components/URLV2FieldDisplay';
import { isFieldChip } from '../types/guards/isFieldChip';
import { isFieldDate } from '../types/guards/isFieldDate';
import { isFieldDoubleText } from '../types/guards/isFieldDoubleText';
import { isFieldDoubleTextChip } from '../types/guards/isFieldDoubleTextChip';
import { isFieldEmail } from '../types/guards/isFieldEmail';
import { isFieldMoney } from '../types/guards/isFieldMoney';
import { isFieldMoneyAmountV2 } from '../types/guards/isFieldMoneyAmountV2';
import { isFieldNumber } from '../types/guards/isFieldNumber';
import { isFieldPhone } from '../types/guards/isFieldPhone';
import { isFieldRelation } from '../types/guards/isFieldRelation';
import { isFieldText } from '../types/guards/isFieldText';
import { isFieldURL } from '../types/guards/isFieldURL';
import { isFieldURLV2 } from '../types/guards/isFieldURLV2';

export const FieldDisplay = () => {
  const { fieldDefinition } = useContext(FieldContext);

  return (
    <>
      {isFieldRelation(fieldDefinition) ? (
        <RelationFieldDisplay />
      ) : isFieldText(fieldDefinition) ? (
        <TextFieldDisplay />
      ) : isFieldEmail(fieldDefinition) ? (
        <EmailFieldDisplay />
      ) : isFieldDate(fieldDefinition) ? (
        <DateFieldDisplay />
      ) : isFieldNumber(fieldDefinition) ? (
        <NumberFieldDisplay />
      ) : isFieldMoney(fieldDefinition) ? (
        <MoneyFieldDisplay />
      ) : isFieldURL(fieldDefinition) ? (
        <URLFieldDisplay />
      ) : isFieldURLV2(fieldDefinition) ? (
        <URLV2FieldDisplay />
      ) : isFieldMoneyAmountV2(fieldDefinition) ? (
        <MoneyAmountV2FieldDisplay />
      ) : isFieldPhone(fieldDefinition) ? (
        <PhoneFieldDisplay />
      ) : isFieldChip(fieldDefinition) ? (
        <ChipFieldDisplay />
      ) : isFieldDoubleTextChip(fieldDefinition) ? (
        <DoubleTextChipFieldDisplay />
      ) : isFieldDoubleText(fieldDefinition) ? (
        <DoubleTextFieldDisplay />
      ) : (
        <></>
      )}
    </>
  );
};
