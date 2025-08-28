import { useContext } from 'react';

import { AddressFieldInput } from '@/object-record/record-field/ui/meta-types/input/components/AddressFieldInput';
import { DateFieldInput } from '@/object-record/record-field/ui/meta-types/input/components/DateFieldInput';
import { EmailsFieldInput } from '@/object-record/record-field/ui/meta-types/input/components/EmailsFieldInput';
import { FullNameFieldInput } from '@/object-record/record-field/ui/meta-types/input/components/FullNameFieldInput';
import { LinksFieldInput } from '@/object-record/record-field/ui/meta-types/input/components/LinksFieldInput';
import { MultiSelectFieldInput } from '@/object-record/record-field/ui/meta-types/input/components/MultiSelectFieldInput';
import { PhonesFieldInput } from '@/object-record/record-field/ui/meta-types/input/components/PhonesFieldInput';
import { RawJsonFieldInput } from '@/object-record/record-field/ui/meta-types/input/components/RawJsonFieldInput';
import { RelationFromManyFieldInput } from '@/object-record/record-field/ui/meta-types/input/components/RelationFromManyFieldInput';
import { SelectFieldInput } from '@/object-record/record-field/ui/meta-types/input/components/SelectFieldInput';
import { isFieldPhones } from '@/object-record/record-field/ui/types/guards/isFieldPhones';
import { isFieldRelationFromManyObjects } from '@/object-record/record-field/ui/types/guards/isFieldRelationFromManyObjects';

import { ArrayFieldInput } from '@/object-record/record-field/ui/meta-types/input/components/ArrayFieldInput';
import { MorphRelationManyToOneFieldInput } from '@/object-record/record-field/ui/meta-types/input/components/MorphRelationManyToOneFieldInput';
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
import { isFieldMultiSelect } from '@/object-record/record-field/ui/types/guards/isFieldMultiSelect';
import { isFieldNumber } from '@/object-record/record-field/ui/types/guards/isFieldNumber';
import { isFieldRating } from '@/object-record/record-field/ui/types/guards/isFieldRating';
import { isFieldRawJson } from '@/object-record/record-field/ui/types/guards/isFieldRawJson';
import { isFieldRelationToOneObject } from '@/object-record/record-field/ui/types/guards/isFieldRelationToOneObject';
import { isFieldRichTextV2 } from '@/object-record/record-field/ui/types/guards/isFieldRichTextV2';
import { isFieldSelect } from '@/object-record/record-field/ui/types/guards/isFieldSelect';
import { FieldContext } from '../contexts/FieldContext';
import { BooleanFieldInput } from '../meta-types/input/components/BooleanFieldInput';
import { CurrencyFieldInput } from '../meta-types/input/components/CurrencyFieldInput';
import { DateTimeFieldInput } from '../meta-types/input/components/DateTimeFieldInput';
import { NumberFieldInput } from '../meta-types/input/components/NumberFieldInput';
import { RatingFieldInput } from '../meta-types/input/components/RatingFieldInput';
import { RelationToOneFieldInput } from '../meta-types/input/components/RelationToOneFieldInput';
import { TextFieldInput } from '../meta-types/input/components/TextFieldInput';
import { isFieldText } from '../types/guards/isFieldText';

export const FieldInput = () => {
  const { fieldDefinition } = useContext(FieldContext);

  return (
    <>
      {isFieldRelationToOneObject(fieldDefinition) ? (
        <RelationToOneFieldInput />
      ) : isFieldRelationFromManyObjects(fieldDefinition) ? (
        <RelationFromManyFieldInput />
      ) : isFieldMorphRelationManyToOne(fieldDefinition) ? (
        <MorphRelationManyToOneFieldInput />
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
