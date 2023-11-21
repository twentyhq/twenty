import { useContext } from 'react';

import { FullNameFieldDisplay } from '@/ui/object/field/meta-types/display/components/FullNameFieldDisplay';
import { LinkFieldDisplay } from '@/ui/object/field/meta-types/display/components/LinkFieldDisplay';
import { RelationFieldDisplay } from '@/ui/object/field/meta-types/display/components/RelationFieldDisplay';
import { UuidFieldDisplay } from '@/ui/object/field/meta-types/display/components/UuidFieldDisplay';
import { isFieldFullName } from '@/ui/object/field/types/guards/isFieldFullName';
import { isFieldLink } from '@/ui/object/field/types/guards/isFieldLink';
import { isFieldUuid } from '@/ui/object/field/types/guards/isFieldUuid';

import { FieldContext } from '../contexts/FieldContext';
import { CurrencyFieldDisplay } from '../meta-types/display/components/CurrencyFieldDisplay';
import { DateFieldDisplay } from '../meta-types/display/components/DateFieldDisplay';
import { EmailFieldDisplay } from '../meta-types/display/components/EmailFieldDisplay';
import { NumberFieldDisplay } from '../meta-types/display/components/NumberFieldDisplay';
import { PhoneFieldDisplay } from '../meta-types/display/components/PhoneFieldDisplay';
import { TextFieldDisplay } from '../meta-types/display/components/TextFieldDisplay';
import { isFieldCurrency } from '../types/guards/isFieldCurrency';
import { isFieldDateTime } from '../types/guards/isFieldDateTime';
import { isFieldEmail } from '../types/guards/isFieldEmail';
import { isFieldNumber } from '../types/guards/isFieldNumber';
import { isFieldPhone } from '../types/guards/isFieldPhone';
import { isFieldRelation } from '../types/guards/isFieldRelation';
import { isFieldText } from '../types/guards/isFieldText';

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
      ) : isFieldDateTime(fieldDefinition) ? (
        <DateFieldDisplay />
      ) : isFieldNumber(fieldDefinition) ? (
        <NumberFieldDisplay />
      ) : isFieldLink(fieldDefinition) ? (
        <LinkFieldDisplay />
      ) : isFieldCurrency(fieldDefinition) ? (
        <CurrencyFieldDisplay />
      ) : isFieldFullName(fieldDefinition) ? (
        <FullNameFieldDisplay />
      ) : isFieldPhone(fieldDefinition) ? (
        <PhoneFieldDisplay />
      ) : (
        <></>
      )}
    </>
  );
};
