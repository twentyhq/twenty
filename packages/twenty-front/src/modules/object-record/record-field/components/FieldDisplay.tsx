import { useContext } from 'react';

import { FieldContext } from '../contexts/FieldContext';
import { AddressFieldDisplay } from '../meta-types/display/components/AddressFieldDisplay';
import { ChipFieldDisplay } from '../meta-types/display/components/ChipFieldDisplay';
import { CurrencyFieldDisplay } from '../meta-types/display/components/CurrencyFieldDisplay';
import { DateFieldDisplay } from '../meta-types/display/components/DateFieldDisplay';
import { EmailFieldDisplay } from '../meta-types/display/components/EmailFieldDisplay';
import { FullNameFieldDisplay } from '../meta-types/display/components/FullNameFieldDisplay';
import { JsonFieldDisplay } from '../meta-types/display/components/JsonFieldDisplay';
import { LinkFieldDisplay } from '../meta-types/display/components/LinkFieldDisplay';
import { MultiSelectFieldDisplay } from '../meta-types/display/components/MultiSelectFieldDisplay.tsx';
import { NumberFieldDisplay } from '../meta-types/display/components/NumberFieldDisplay';
import { PhoneFieldDisplay } from '../meta-types/display/components/PhoneFieldDisplay';
import { RelationFieldDisplay } from '../meta-types/display/components/RelationFieldDisplay';
import { SelectFieldDisplay } from '../meta-types/display/components/SelectFieldDisplay';
import { TextFieldDisplay } from '../meta-types/display/components/TextFieldDisplay';
import { UuidFieldDisplay } from '../meta-types/display/components/UuidFieldDisplay';
import { isFieldAddress } from '../types/guards/isFieldAddress';
import { isFieldCurrency } from '../types/guards/isFieldCurrency';
import { isFieldDateTime } from '../types/guards/isFieldDateTime';
import { isFieldEmail } from '../types/guards/isFieldEmail';
import { isFieldFullName } from '../types/guards/isFieldFullName';
import { isFieldLink } from '../types/guards/isFieldLink';
import { isFieldMultiSelect } from '../types/guards/isFieldMultiSelect.ts';
import { isFieldNumber } from '../types/guards/isFieldNumber';
import { isFieldPhone } from '../types/guards/isFieldPhone';
import { isFieldRawJson } from '../types/guards/isFieldRawJson';
import { isFieldRelation } from '../types/guards/isFieldRelation';
import { isFieldSelect } from '../types/guards/isFieldSelect';
import { isFieldText } from '../types/guards/isFieldText';
import { isFieldUuid } from '../types/guards/isFieldUuid';

export const FieldDisplay = () => {
  const { fieldDefinition, isLabelIdentifier } = useContext(FieldContext);

  return isLabelIdentifier &&
    (isFieldText(fieldDefinition) ||
      isFieldFullName(fieldDefinition) ||
      isFieldNumber(fieldDefinition)) ? (
    <ChipFieldDisplay />
  ) : isFieldRelation(fieldDefinition) ? (
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
  ) : isFieldSelect(fieldDefinition) ? (
    <SelectFieldDisplay />
  ) : isFieldMultiSelect(fieldDefinition) ? (
    <MultiSelectFieldDisplay />
  ) : isFieldAddress(fieldDefinition) ? (
    <AddressFieldDisplay />
  ) : isFieldRawJson(fieldDefinition) ? (
    <JsonFieldDisplay />
  ) : null;
};
