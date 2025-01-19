import { useContext } from 'react';

import { ActorFieldDisplay } from '@/object-record/record-field/meta-types/display/components/ActorFieldDisplay';
import { ArrayFieldDisplay } from '@/object-record/record-field/meta-types/display/components/ArrayFieldDisplay';
import { BooleanFieldDisplay } from '@/object-record/record-field/meta-types/display/components/BooleanFieldDisplay';
import { EmailsFieldDisplay } from '@/object-record/record-field/meta-types/display/components/EmailsFieldDisplay';
import { LinksFieldDisplay } from '@/object-record/record-field/meta-types/display/components/LinksFieldDisplay';
import { PhonesFieldDisplay } from '@/object-record/record-field/meta-types/display/components/PhonesFieldDisplay';
import { RatingFieldDisplay } from '@/object-record/record-field/meta-types/display/components/RatingFieldDisplay';
import { RelationFromManyFieldDisplay } from '@/object-record/record-field/meta-types/display/components/RelationFromManyFieldDisplay';
import { RichTextFieldDisplay } from '@/object-record/record-field/meta-types/display/components/RichTextFieldDisplay';
import { isFieldIdentifierDisplay } from '@/object-record/record-field/meta-types/display/utils/isFieldIdentifierDisplay';
import { isFieldActor } from '@/object-record/record-field/types/guards/isFieldActor';
import { isFieldArray } from '@/object-record/record-field/types/guards/isFieldArray';
import { isFieldBoolean } from '@/object-record/record-field/types/guards/isFieldBoolean';
import { isFieldEmails } from '@/object-record/record-field/types/guards/isFieldEmails';
import { isFieldLinks } from '@/object-record/record-field/types/guards/isFieldLinks';
import { isFieldPhones } from '@/object-record/record-field/types/guards/isFieldPhones';
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
import { FullNameFieldDisplay } from '../meta-types/display/components/FullNameFieldDisplay';
import { JsonFieldDisplay } from '../meta-types/display/components/JsonFieldDisplay';
import { MultiSelectFieldDisplay } from '../meta-types/display/components/MultiSelectFieldDisplay';
import { NumberFieldDisplay } from '../meta-types/display/components/NumberFieldDisplay';
import { RelationToOneFieldDisplay } from '../meta-types/display/components/RelationToOneFieldDisplay';
import { SelectFieldDisplay } from '../meta-types/display/components/SelectFieldDisplay';
import { TextFieldDisplay } from '../meta-types/display/components/TextFieldDisplay';
import { UuidFieldDisplay } from '../meta-types/display/components/UuidFieldDisplay';
import { isFieldAddress } from '../types/guards/isFieldAddress';
import { isFieldCurrency } from '../types/guards/isFieldCurrency';
import { isFieldDate } from '../types/guards/isFieldDate';
import { isFieldDateTime } from '../types/guards/isFieldDateTime';
import { isFieldFullName } from '../types/guards/isFieldFullName';
import { isFieldMultiSelect } from '../types/guards/isFieldMultiSelect';
import { isFieldNumber } from '../types/guards/isFieldNumber';
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
  ) : isFieldText(fieldDefinition) ? (
    <TextFieldDisplay />
  ) : isFieldUuid(fieldDefinition) ? (
    <UuidFieldDisplay />
  ) : isFieldDateTime(fieldDefinition) ? (
    <DateTimeFieldDisplay />
  ) : isFieldDate(fieldDefinition) ? (
    <DateFieldDisplay />
  ) : isFieldNumber(fieldDefinition) ? (
    <NumberFieldDisplay />
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
  ) : isFieldArray(fieldDefinition) ? (
    <ArrayFieldDisplay />
  ) : isFieldEmails(fieldDefinition) ? (
    <EmailsFieldDisplay />
  ) : isFieldPhones(fieldDefinition) ? (
    <PhonesFieldDisplay />
  ) : null;
};
