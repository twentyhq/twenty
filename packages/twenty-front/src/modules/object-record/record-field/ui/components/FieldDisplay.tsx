import { useContext } from 'react';

import { ActorFieldDisplay } from '@/object-record/record-field/ui/meta-types/display/components/ActorFieldDisplay';
import { ArrayFieldDisplay } from '@/object-record/record-field/ui/meta-types/display/components/ArrayFieldDisplay';
import { BooleanFieldDisplay } from '@/object-record/record-field/ui/meta-types/display/components/BooleanFieldDisplay';
import { EmailsFieldDisplay } from '@/object-record/record-field/ui/meta-types/display/components/EmailsFieldDisplay';
import { ForbiddenFieldDisplay } from '@/object-record/record-field/ui/meta-types/display/components/ForbiddenFieldDisplay';
import { LinksFieldDisplay } from '@/object-record/record-field/ui/meta-types/display/components/LinksFieldDisplay';
import { PhonesFieldDisplay } from '@/object-record/record-field/ui/meta-types/display/components/PhonesFieldDisplay';
import { RatingFieldDisplay } from '@/object-record/record-field/ui/meta-types/display/components/RatingFieldDisplay';
import { RelationFromManyFieldDisplay } from '@/object-record/record-field/ui/meta-types/display/components/RelationFromManyFieldDisplay';
import { RichTextFieldDisplay } from '@/object-record/record-field/ui/meta-types/display/components/RichTextFieldDisplay';
import { RichTextV2FieldDisplay } from '@/object-record/record-field/ui/meta-types/display/components/RichTextV2FieldDisplay';
import { isFieldIdentifierDisplay } from '@/object-record/record-field/ui/meta-types/display/utils/isFieldIdentifierDisplay';
import { isFieldActor } from '@/object-record/record-field/ui/types/guards/isFieldActor';
import { isFieldArray } from '@/object-record/record-field/ui/types/guards/isFieldArray';
import { isFieldBoolean } from '@/object-record/record-field/ui/types/guards/isFieldBoolean';
import { isFieldEmails } from '@/object-record/record-field/ui/types/guards/isFieldEmails';
import { isFieldLinks } from '@/object-record/record-field/ui/types/guards/isFieldLinks';
import { isFieldPhones } from '@/object-record/record-field/ui/types/guards/isFieldPhones';
import { isFieldRating } from '@/object-record/record-field/ui/types/guards/isFieldRating';
import { isFieldRichText } from '@/object-record/record-field/ui/types/guards/isFieldRichText';
import { isFieldRichTextV2 } from '@/object-record/record-field/ui/types/guards/isFieldRichTextV2';

import { MorphRelationManyToOneFieldDisplay } from '@/object-record/record-field/ui/meta-types/display/components/MorphRelationManyToOneFieldDisplay';
import { MorphRelationOneToManyFieldDisplay } from '@/object-record/record-field/ui/meta-types/display/components/MorphRelationOneToManyFieldDisplay';
import { isFieldMorphRelationManyToOne } from '@/object-record/record-field/ui/types/guards/isFieldMorphRelationManyToOne';
import { isFieldMorphRelationOneToMany } from '@/object-record/record-field/ui/types/guards/isFieldMorphRelationOneToMany';
import { isFieldRelationManyToOne } from '@/object-record/record-field/ui/types/guards/isFieldRelationManyToOne';
import { isFieldRelationOneToMany } from '@/object-record/record-field/ui/types/guards/isFieldRelationOneToMany';
import { isDefined } from 'twenty-shared/utils';
import { FieldContext } from '@/object-record/record-field/ui/contexts/FieldContext';
import { AddressFieldDisplay } from '@/object-record/record-field/ui/meta-types/display/components/AddressFieldDisplay';
import { ChipFieldDisplay } from '@/object-record/record-field/ui/meta-types/display/components/ChipFieldDisplay';
import { CurrencyFieldDisplay } from '@/object-record/record-field/ui/meta-types/display/components/CurrencyFieldDisplay';
import { DateFieldDisplay } from '@/object-record/record-field/ui/meta-types/display/components/DateFieldDisplay';
import { DateTimeFieldDisplay } from '@/object-record/record-field/ui/meta-types/display/components/DateTimeFieldDisplay';
import { FullNameFieldDisplay } from '@/object-record/record-field/ui/meta-types/display/components/FullNameFieldDisplay';
import { JsonFieldDisplay } from '@/object-record/record-field/ui/meta-types/display/components/JsonFieldDisplay';
import { MultiSelectFieldDisplay } from '@/object-record/record-field/ui/meta-types/display/components/MultiSelectFieldDisplay';
import { NumberFieldDisplay } from '@/object-record/record-field/ui/meta-types/display/components/NumberFieldDisplay';
import { RelationToOneFieldDisplay } from '@/object-record/record-field/ui/meta-types/display/components/RelationToOneFieldDisplay';
import { SelectFieldDisplay } from '@/object-record/record-field/ui/meta-types/display/components/SelectFieldDisplay';
import { TextFieldDisplay } from '@/object-record/record-field/ui/meta-types/display/components/TextFieldDisplay';
import { UuidFieldDisplay } from '@/object-record/record-field/ui/meta-types/display/components/UuidFieldDisplay';
import { isFieldAddress } from '@/object-record/record-field/ui/types/guards/isFieldAddress';
import { isFieldCurrency } from '@/object-record/record-field/ui/types/guards/isFieldCurrency';
import { isFieldDate } from '@/object-record/record-field/ui/types/guards/isFieldDate';
import { isFieldDateTime } from '@/object-record/record-field/ui/types/guards/isFieldDateTime';
import { isFieldFullName } from '@/object-record/record-field/ui/types/guards/isFieldFullName';
import { isFieldMultiSelect } from '@/object-record/record-field/ui/types/guards/isFieldMultiSelect';
import { isFieldNumber } from '@/object-record/record-field/ui/types/guards/isFieldNumber';
import { isFieldRawJson } from '@/object-record/record-field/ui/types/guards/isFieldRawJson';
import { isFieldSelect } from '@/object-record/record-field/ui/types/guards/isFieldSelect';
import { isFieldText } from '@/object-record/record-field/ui/types/guards/isFieldText';
import { isFieldUuid } from '@/object-record/record-field/ui/types/guards/isFieldUuid';

export const FieldDisplay = () => {
  const {
    fieldDefinition,
    isLabelIdentifier,
    isForbidden,
    isRecordFieldReadOnly,
  } = useContext(FieldContext);

  const isChipDisplay = isFieldIdentifierDisplay(
    fieldDefinition,
    isLabelIdentifier,
  );

  if (isDefined(isForbidden) && isForbidden) {
    return <ForbiddenFieldDisplay />;
  }

  return isChipDisplay ? (
    <ChipFieldDisplay />
  ) : isFieldRelationManyToOne(fieldDefinition) ? (
    <RelationToOneFieldDisplay />
  ) : isFieldRelationOneToMany(fieldDefinition) ? (
    <RelationFromManyFieldDisplay />
  ) : isFieldMorphRelationManyToOne(fieldDefinition) ? (
    <MorphRelationManyToOneFieldDisplay />
  ) : isFieldMorphRelationOneToMany(fieldDefinition) ? (
    <MorphRelationOneToManyFieldDisplay />
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
    <RatingFieldDisplay readonly={isRecordFieldReadOnly} />
  ) : isFieldRichText(fieldDefinition) ? (
    <RichTextFieldDisplay />
  ) : isFieldRichTextV2(fieldDefinition) ? (
    <RichTextV2FieldDisplay />
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
