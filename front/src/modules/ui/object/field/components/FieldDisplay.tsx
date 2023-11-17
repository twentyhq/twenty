import { useContext } from 'react';

import { FullNameFieldDisplay } from '@/ui/object/field/meta-types/display/components/FullNameFieldDisplay';
import { LinkFieldDisplay } from '@/ui/object/field/meta-types/display/components/LinkFieldDisplay';
import { RelationFieldDisplay } from '@/ui/object/field/meta-types/display/components/RelationFieldDisplay';
import { UuidFieldDisplay } from '@/ui/object/field/meta-types/display/components/UuidFieldDisplay';
import { isFieldFullName } from '@/ui/object/field/types/guards/isFieldFullName';
import { isFieldLink } from '@/ui/object/field/types/guards/isFieldLink';
import { isFieldUuid } from '@/ui/object/field/types/guards/isFieldUuid';

import { FieldContext } from '../contexts/FieldContext';
import { ChipFieldDisplay } from '../meta-types/display/components/ChipFieldDisplay';
import { CurrencyFieldDisplay } from '../meta-types/display/components/CurrencyFieldDisplay';
import { DateFieldDisplay } from '../meta-types/display/components/DateFieldDisplay';
import { DoubleTextChipFieldDisplay } from '../meta-types/display/components/DoubleTextChipFieldDisplay';
import { EmailFieldDisplay } from '../meta-types/display/components/EmailFieldDisplay';
import { EnumFieldDisplay } from '../meta-types/display/components/EnumFieldDisplay';
import { MoneyFieldDisplay } from '../meta-types/display/components/MoneyFieldDisplay';
import { NumberFieldDisplay } from '../meta-types/display/components/NumberFieldDisplay';
import { PhoneFieldDisplay } from '../meta-types/display/components/PhoneFieldDisplay';
import { TextFieldDisplay } from '../meta-types/display/components/TextFieldDisplay';
import { URLFieldDisplay } from '../meta-types/display/components/URLFieldDisplay';
import { isFieldChip } from '../types/guards/isFieldChip';
import { isFieldCurrency } from '../types/guards/isFieldCurrency';
import { isFieldDate } from '../types/guards/isFieldDate';
import { isFieldDoubleTextChip } from '../types/guards/isFieldDoubleTextChip';
import { isFieldEmail } from '../types/guards/isFieldEmail';
import { isFieldEnum } from '../types/guards/isFieldEnum';
import { isFieldMoney } from '../types/guards/isFieldMoney';
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
      ) : isFieldUuid(fieldDefinition) ? (
        <UuidFieldDisplay />
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
      ) : isFieldLink(fieldDefinition) ? (
        <LinkFieldDisplay />
      ) : isFieldCurrency(fieldDefinition) ? (
        <CurrencyFieldDisplay />
      ) : isFieldFullName(fieldDefinition) ? (
        <FullNameFieldDisplay />
      ) : isFieldPhone(fieldDefinition) ? (
        <PhoneFieldDisplay />
      ) : isFieldChip(fieldDefinition) ? (
        <ChipFieldDisplay />
      ) : isFieldDoubleTextChip(fieldDefinition) ? (
        <DoubleTextChipFieldDisplay />
      ) : isFieldEnum(fieldDefinition) ? (
        <EnumFieldDisplay />
      ) : (
        <></>
      )}
    </>
  );
};
