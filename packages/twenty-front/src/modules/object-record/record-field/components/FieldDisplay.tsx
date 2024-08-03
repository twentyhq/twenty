import { useContext } from 'react';

import { ActorFieldDisplay } from '@/object-record/record-field/meta-types/display/components/ActorFieldDisplay';
import { BooleanFieldDisplay } from '@/object-record/record-field/meta-types/display/components/BooleanFieldDisplay';
import { LinksFieldDisplay } from '@/object-record/record-field/meta-types/display/components/LinksFieldDisplay';
import { RatingFieldDisplay } from '@/object-record/record-field/meta-types/display/components/RatingFieldDisplay';
import { RelationFromManyFieldDisplay } from '@/object-record/record-field/meta-types/display/components/RelationFromManyFieldDisplay';
import { RichTextFieldDisplay } from '@/object-record/record-field/meta-types/display/components/RichTextFieldDisplay';
import { isFieldIdentifierDisplay } from '@/object-record/record-field/meta-types/display/utils/isFieldIdentifierDisplay';
import { isFieldActor } from '@/object-record/record-field/types/guards/isFieldActor';
import { isFieldBoolean } from '@/object-record/record-field/types/guards/isFieldBoolean';
import { isFieldDisplayedAsPhone } from '@/object-record/record-field/types/guards/isFieldDisplayedAsPhone';
import { isFieldLinks } from '@/object-record/record-field/types/guards/isFieldLinks';
import { isFieldRating } from '@/object-record/record-field/types/guards/isFieldRating';
import { isFieldRelationFromManyObjects } from '@/object-record/record-field/types/guards/isFieldRelationFromManyObjects';
import { isFieldRelationToOneObject } from '@/object-record/record-field/types/guards/isFieldRelationToOneObject';
import { isFieldRichText } from '@/object-record/record-field/types/guards/isFieldRichText';
import { FieldContext } from '../contexts/FieldContext';
import { AddressFieldDisplay } from '../meta-types/display/components/AddressFieldDisplay';
import { ChipFieldDisplay } from '../meta-types/display/components/ChipFieldDisplay';
import { CurrencyFieldDisplay } from '../meta-types/display/components/CurrencyFieldDisplay';
import { DateFieldDisplay } from '../meta-types/display/components/DateFieldDisplay';
import { DateTimeFieldDisplay } from '../meta-types/display/components/DateTimeFieldDisplay';
import { EmailFieldDisplay } from '../meta-types/display/components/EmailFieldDisplay';
import { FullNameFieldDisplay } from '../meta-types/display/components/FullNameFieldDisplay';
import { JsonFieldDisplay } from '../meta-types/display/components/JsonFieldDisplay';
import { LinkFieldDisplay } from '../meta-types/display/components/LinkFieldDisplay';
import { MultiSelectFieldDisplay } from '../meta-types/display/components/MultiSelectFieldDisplay';
import { NumberFieldDisplay } from '../meta-types/display/components/NumberFieldDisplay';
import { PhoneFieldDisplay } from '../meta-types/display/components/PhoneFieldDisplay';
import { RelationToOneFieldDisplay } from '../meta-types/display/components/RelationToOneFieldDisplay';
import { SelectFieldDisplay } from '../meta-types/display/components/SelectFieldDisplay';
import { TextFieldDisplay } from '../meta-types/display/components/TextFieldDisplay';
import { UuidFieldDisplay } from '../meta-types/display/components/UuidFieldDisplay';
import { isFieldAddress } from '../types/guards/isFieldAddress';
import { isFieldCurrency } from '../types/guards/isFieldCurrency';
import { isFieldDate } from '../types/guards/isFieldDate';
import { isFieldDateTime } from '../types/guards/isFieldDateTime';
import { isFieldEmail } from '../types/guards/isFieldEmail';
import { isFieldFullName } from '../types/guards/isFieldFullName';
import { isFieldLink } from '../types/guards/isFieldLink';
import { isFieldMultiSelect } from '../types/guards/isFieldMultiSelect';
import { isFieldNumber } from '../types/guards/isFieldNumber';
import { isFieldPhone } from '../types/guards/isFieldPhone';
import { isFieldRawJson } from '../types/guards/isFieldRawJson';
import { isFieldSelect } from '../types/guards/isFieldSelect';
import { isFieldText } from '../types/guards/isFieldText';
import { isFieldUuid } from '../types/guards/isFieldUuid';

export const FieldDisplay = () => {
  const { fieldDefinition, isLabelIdentifier } = useContext(FieldContext);

  const isChipDisplay = isFieldIdentifierDisplay(
    fieldDefinition,
    isLabelIdentifier,
  );

  return isChipDisplay ? (
    <ChipFieldDisplay />
  ) : isFieldRelationToOneObject(fieldDefinition) ? (
    <RelationToOneFieldDisplay />
  ) : isFieldRelationFromManyObjects(fieldDefinition) ? (
    <RelationFromManyFieldDisplay />
  ) : isFieldPhone(fieldDefinition) ||
    isFieldDisplayedAsPhone(fieldDefinition) ? (
    <PhoneFieldDisplay />
  ) : isFieldText(fieldDefinition) ? (
    <TextFieldDisplay />
  ) : isFieldUuid(fieldDefinition) ? (
    <UuidFieldDisplay />
  ) : isFieldEmail(fieldDefinition) ? (
    <EmailFieldDisplay />
  ) : isFieldDateTime(fieldDefinition) ? (
    <DateTimeFieldDisplay />
  ) : isFieldDate(fieldDefinition) ? (
    <DateFieldDisplay />
  ) : isFieldNumber(fieldDefinition) ? (
    <NumberFieldDisplay />
  ) : isFieldLink(fieldDefinition) ? (
    <LinkFieldDisplay />
  ) : isFieldLinks(fieldDefinition) ? (
    <LinksFieldDisplay />
  ) : isFieldCurrency(fieldDefinition) ? (
    <CurrencyFieldDisplay />
  ) : isFieldFullName(fieldDefinition) ? (
    <FullNameFieldDisplay />
  ) : isFieldSelect(fieldDefinition) ? (
    <SelectFieldDisplay />
  ) : isFieldMultiSelect(fieldDefinition) ? (
    <MultiSelectFieldDisplay />
  ) : isFieldAddress(fieldDefinition) ? (
    <AddressFieldDisplay />
  ) : isFieldRawJson(fieldDefinition) ? (
    <JsonFieldDisplay />
  ) : isFieldBoolean(fieldDefinition) ? (
    <BooleanFieldDisplay />
  ) : isFieldRating(fieldDefinition) ? (
    <RatingFieldDisplay />
  ) : isFieldRichText(fieldDefinition) ? (
    <RichTextFieldDisplay />
  ) : isFieldActor(fieldDefinition) ? (
    <ActorFieldDisplay />
  ) : null;
};
