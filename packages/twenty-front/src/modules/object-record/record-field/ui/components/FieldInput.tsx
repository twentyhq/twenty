import { useContext } from 'react';

import { AddressFieldInput } from '@/object-record/record-field/ui/meta-types/input/components/AddressFieldInput';
import { DateFieldInput } from '@/object-record/record-field/ui/meta-types/input/components/DateFieldInput';
import { EmailsFieldInput } from '@/object-record/record-field/ui/meta-types/input/components/EmailsFieldInput';
import { FullNameFieldInput } from '@/object-record/record-field/ui/meta-types/input/components/FullNameFieldInput';
import { LinksFieldInput } from '@/object-record/record-field/ui/meta-types/input/components/LinksFieldInput';
import { MultiSelectFieldInput } from '@/object-record/record-field/ui/meta-types/input/components/MultiSelectFieldInput';
import { PhonesFieldInput } from '@/object-record/record-field/ui/meta-types/input/components/PhonesFieldInput';
import { RawJsonFieldInput } from '@/object-record/record-field/ui/meta-types/input/components/RawJsonFieldInput';
import { SelectFieldInput } from '@/object-record/record-field/ui/meta-types/input/components/SelectFieldInput';
import { isFieldPhones } from '@/object-record/record-field/ui/types/guards/isFieldPhones';

import { ArrayFieldInput } from '@/object-record/record-field/ui/meta-types/input/components/ArrayFieldInput';
import { MorphRelationManyToOneFieldInput } from '@/object-record/record-field/ui/meta-types/input/components/MorphRelationManyToOneFieldInput';
import { MorphRelationOneToManyFieldInput } from '@/object-record/record-field/ui/meta-types/input/components/MorphRelationOneToManyFieldInput';
import { RelationManyToOneFieldInput } from '@/object-record/record-field/ui/meta-types/input/components/RelationManyToOneFieldInput';
import { RelationOneToManyFieldInput } from '@/object-record/record-field/ui/meta-types/input/components/RelationOneToManyFieldInput';
import { RichTextFieldInput } from '@/object-record/record-field/ui/meta-types/input/components/RichTextFieldInput';
import { isFieldAddress } from '@/object-record/record-field/ui/types/guards/isFieldAddress';
import { isFieldArray } from '@/object-record/record-field/ui/types/guards/isFieldArray';
import { isFieldBoolean } from '@/object-record/record-field/ui/types/guards/isFieldBoolean';
import { isFieldCurrency } from '@/object-record/record-field/ui/types/guards/isFieldCurrency';
import { isFieldDate } from '@/object-record/record-field/ui/types/guards/isFieldDate';
import { isFieldDateTime } from '@/object-record/record-field/ui/types/guards/isFieldDateTime';
import { isFieldEmails } from '@/object-record/record-field/ui/types/guards/isFieldEmails';
import { isFieldFullName } from '@/object-record/record-field/ui/types/guards/isFieldFullName';
import { isFieldLinks } from '@/object-record/record-field/ui/types/guards/isFieldLinks';
import { isFieldMorphRelationManyToOne } from '@/object-record/record-field/ui/types/guards/isFieldMorphRelationManyToOne';
import { isFieldMorphRelationOneToMany } from '@/object-record/record-field/ui/types/guards/isFieldMorphRelationOneToMany';
import { isFieldMultiSelect } from '@/object-record/record-field/ui/types/guards/isFieldMultiSelect';
import { isFieldNumber } from '@/object-record/record-field/ui/types/guards/isFieldNumber';
import { isFieldRating } from '@/object-record/record-field/ui/types/guards/isFieldRating';
import { isFieldRawJson } from '@/object-record/record-field/ui/types/guards/isFieldRawJson';
import { isFieldRelationManyToOne } from '@/object-record/record-field/ui/types/guards/isFieldRelationManyToOne';
import { isFieldRelationOneToMany } from '@/object-record/record-field/ui/types/guards/isFieldRelationOneToMany';
import { isFieldRichTextV2 } from '@/object-record/record-field/ui/types/guards/isFieldRichTextV2';
import { isFieldSelect } from '@/object-record/record-field/ui/types/guards/isFieldSelect';
import { FieldContext } from '@/object-record/record-field/ui/contexts/FieldContext';
import { BooleanFieldInput } from '@/object-record/record-field/ui/meta-types/input/components/BooleanFieldInput';
import { CurrencyFieldInput } from '@/object-record/record-field/ui/meta-types/input/components/CurrencyFieldInput';
import { DateTimeFieldInput } from '@/object-record/record-field/ui/meta-types/input/components/DateTimeFieldInput';
import { NumberFieldInput } from '@/object-record/record-field/ui/meta-types/input/components/NumberFieldInput';
import { RatingFieldInput } from '@/object-record/record-field/ui/meta-types/input/components/RatingFieldInput';
import { TextFieldInput } from '@/object-record/record-field/ui/meta-types/input/components/TextFieldInput';
import { isFieldText } from '@/object-record/record-field/ui/types/guards/isFieldText';

export const FieldInput = () => {
  const { fieldDefinition } = useContext(FieldContext);

  return (
    <>
      {isFieldRelationManyToOne(fieldDefinition) ? (
        <RelationManyToOneFieldInput />
      ) : isFieldRelationOneToMany(fieldDefinition) ? (
        <RelationOneToManyFieldInput />
      ) : isFieldMorphRelationManyToOne(fieldDefinition) ? (
        <MorphRelationManyToOneFieldInput />
      ) : isFieldMorphRelationOneToMany(fieldDefinition) ? (
        <MorphRelationOneToManyFieldInput />
      ) : isFieldPhones(fieldDefinition) ? (
        <PhonesFieldInput />
      ) : isFieldText(fieldDefinition) ? (
        <TextFieldInput />
      ) : isFieldEmails(fieldDefinition) ? (
        <EmailsFieldInput />
      ) : isFieldFullName(fieldDefinition) ? (
        <FullNameFieldInput />
      ) : isFieldDateTime(fieldDefinition) ? (
        <DateTimeFieldInput />
      ) : isFieldDate(fieldDefinition) ? (
        <DateFieldInput />
      ) : isFieldNumber(fieldDefinition) ? (
        <NumberFieldInput />
      ) : isFieldLinks(fieldDefinition) ? (
        <LinksFieldInput />
      ) : isFieldCurrency(fieldDefinition) ? (
        <CurrencyFieldInput />
      ) : isFieldBoolean(fieldDefinition) ? (
        <BooleanFieldInput />
      ) : isFieldRating(fieldDefinition) ? (
        <RatingFieldInput />
      ) : isFieldSelect(fieldDefinition) ? (
        <SelectFieldInput />
      ) : isFieldMultiSelect(fieldDefinition) ? (
        <MultiSelectFieldInput />
      ) : isFieldAddress(fieldDefinition) ? (
        <AddressFieldInput />
      ) : isFieldRawJson(fieldDefinition) ? (
        <RawJsonFieldInput />
      ) : isFieldArray(fieldDefinition) ? (
        <ArrayFieldInput />
      ) : isFieldRichTextV2(fieldDefinition) ? (
        <RichTextFieldInput />
      ) : (
        <></>
      )}
    </>
  );
};
