import { useContext } from 'react';

import { AddressFieldInput } from '@/object-record/record-field/meta-types/input/components/AddressFieldInput';
import { DateFieldInput } from '@/object-record/record-field/meta-types/input/components/DateFieldInput';
import { FullNameFieldInput } from '@/object-record/record-field/meta-types/input/components/FullNameFieldInput';
import { LinksFieldInput } from '@/object-record/record-field/meta-types/input/components/LinksFieldInput';
import { MultiSelectFieldInput } from '@/object-record/record-field/meta-types/input/components/MultiSelectFieldInput';
import { RawJsonFieldInput } from '@/object-record/record-field/meta-types/input/components/RawJsonFieldInput';
import { RelationFromManyFieldInput } from '@/object-record/record-field/meta-types/input/components/RelationFromManyFieldInput';
import { SelectFieldInput } from '@/object-record/record-field/meta-types/input/components/SelectFieldInput';
import { RecordFieldInputScope } from '@/object-record/record-field/scopes/RecordFieldInputScope';
import { isFieldDate } from '@/object-record/record-field/types/guards/isFieldDate';
import { isFieldDisplayedAsPhone } from '@/object-record/record-field/types/guards/isFieldDisplayedAsPhone';
import { isFieldFullName } from '@/object-record/record-field/types/guards/isFieldFullName';
import { isFieldLinks } from '@/object-record/record-field/types/guards/isFieldLinks';
import { isFieldMultiSelect } from '@/object-record/record-field/types/guards/isFieldMultiSelect';
import { isFieldRawJson } from '@/object-record/record-field/types/guards/isFieldRawJson';
import { isFieldRelationFromManyObjects } from '@/object-record/record-field/types/guards/isFieldRelationFromManyObjects';
import { isFieldRelationToOneObject } from '@/object-record/record-field/types/guards/isFieldRelationToOneObject';
import { isFieldSelect } from '@/object-record/record-field/types/guards/isFieldSelect';
import { getScopeIdFromComponentId } from '@/ui/utilities/recoil-scope/utils/getScopeIdFromComponentId';

import { RichTextFieldInput } from '@/object-record/record-field/meta-types/input/components/RichTextFieldInput';
import { isFieldRichText } from '@/object-record/record-field/types/guards/isFieldRichText';
import { FieldContext } from '../contexts/FieldContext';
import { BooleanFieldInput } from '../meta-types/input/components/BooleanFieldInput';
import { CurrencyFieldInput } from '../meta-types/input/components/CurrencyFieldInput';
import { DateTimeFieldInput } from '../meta-types/input/components/DateTimeFieldInput';
import { EmailFieldInput } from '../meta-types/input/components/EmailFieldInput';
import { LinkFieldInput } from '../meta-types/input/components/LinkFieldInput';
import { NumberFieldInput } from '../meta-types/input/components/NumberFieldInput';
import { PhoneFieldInput } from '../meta-types/input/components/PhoneFieldInput';
import { RatingFieldInput } from '../meta-types/input/components/RatingFieldInput';
import { RelationToOneFieldInput } from '../meta-types/input/components/RelationToOneFieldInput';
import { TextFieldInput } from '../meta-types/input/components/TextFieldInput';
import { FieldInputEvent } from '../types/FieldInputEvent';
import { isFieldAddress } from '../types/guards/isFieldAddress';
import { isFieldBoolean } from '../types/guards/isFieldBoolean';
import { isFieldCurrency } from '../types/guards/isFieldCurrency';
import { isFieldDateTime } from '../types/guards/isFieldDateTime';
import { isFieldEmail } from '../types/guards/isFieldEmail';
import { isFieldLink } from '../types/guards/isFieldLink';
import { isFieldNumber } from '../types/guards/isFieldNumber';
import { isFieldPhone } from '../types/guards/isFieldPhone';
import { isFieldRating } from '../types/guards/isFieldRating';
import { isFieldText } from '../types/guards/isFieldText';

type FieldInputProps = {
  recordFieldInputdId: string;
  onSubmit?: FieldInputEvent;
  onCancel?: () => void;
  onClickOutside?: FieldInputEvent;
  onEnter?: FieldInputEvent;
  onEscape?: FieldInputEvent;
  onTab?: FieldInputEvent;
  onShiftTab?: FieldInputEvent;
  isReadOnly?: boolean;
};

export const FieldInput = ({
  recordFieldInputdId,
  onCancel,
  onSubmit,
  onEnter,
  onEscape,
  onShiftTab,
  onTab,
  onClickOutside,
  isReadOnly,
}: FieldInputProps) => {
  const { fieldDefinition } = useContext(FieldContext);

  return (
    <RecordFieldInputScope
      recordFieldInputScopeId={getScopeIdFromComponentId(recordFieldInputdId)}
    >
      {isFieldRelationToOneObject(fieldDefinition) ? (
        <RelationToOneFieldInput onSubmit={onSubmit} onCancel={onCancel} />
      ) : isFieldRelationFromManyObjects(fieldDefinition) ? (
        <RelationFromManyFieldInput onSubmit={onSubmit} />
      ) : isFieldPhone(fieldDefinition) ||
        isFieldDisplayedAsPhone(fieldDefinition) ? (
        <PhoneFieldInput
          onEnter={onEnter}
          onEscape={onEscape}
          onClickOutside={onClickOutside}
          onTab={onTab}
          onShiftTab={onShiftTab}
        />
      ) : isFieldText(fieldDefinition) ? (
        <TextFieldInput
          onEnter={onEnter}
          onEscape={onEscape}
          onClickOutside={onClickOutside}
          onTab={onTab}
          onShiftTab={onShiftTab}
        />
      ) : isFieldEmail(fieldDefinition) ? (
        <EmailFieldInput
          onEnter={onEnter}
          onEscape={onEscape}
          onClickOutside={onClickOutside}
          onTab={onTab}
          onShiftTab={onShiftTab}
        />
      ) : isFieldFullName(fieldDefinition) ? (
        <FullNameFieldInput
          onEnter={onEnter}
          onEscape={onEscape}
          onClickOutside={onClickOutside}
          onTab={onTab}
          onShiftTab={onShiftTab}
        />
      ) : isFieldDateTime(fieldDefinition) ? (
        <DateTimeFieldInput
          onEnter={onEnter}
          onEscape={onEscape}
          onClickOutside={onClickOutside}
          onClear={onSubmit}
          onSubmit={onSubmit}
        />
      ) : isFieldDate(fieldDefinition) ? (
        <DateFieldInput
          onEnter={onEnter}
          onEscape={onEscape}
          onClickOutside={onClickOutside}
          onClear={onSubmit}
          onSubmit={onSubmit}
        />
      ) : isFieldNumber(fieldDefinition) ? (
        <NumberFieldInput
          onEnter={onEnter}
          onEscape={onEscape}
          onClickOutside={onClickOutside}
          onTab={onTab}
          onShiftTab={onShiftTab}
        />
      ) : isFieldLink(fieldDefinition) ? (
        <LinkFieldInput
          onEnter={onEnter}
          onEscape={onEscape}
          onClickOutside={onClickOutside}
          onTab={onTab}
          onShiftTab={onShiftTab}
        />
      ) : isFieldLinks(fieldDefinition) ? (
        <LinksFieldInput onCancel={onCancel} />
      ) : isFieldCurrency(fieldDefinition) ? (
        <CurrencyFieldInput
          onEnter={onEnter}
          onEscape={onEscape}
          onClickOutside={onClickOutside}
          onTab={onTab}
          onShiftTab={onShiftTab}
        />
      ) : isFieldBoolean(fieldDefinition) ? (
        <BooleanFieldInput onSubmit={onSubmit} readonly={isReadOnly} />
      ) : isFieldRating(fieldDefinition) ? (
        <RatingFieldInput onSubmit={onSubmit} />
      ) : isFieldSelect(fieldDefinition) ? (
        <SelectFieldInput onSubmit={onSubmit} onCancel={onCancel} />
      ) : isFieldMultiSelect(fieldDefinition) ? (
        <MultiSelectFieldInput onCancel={onCancel} />
      ) : isFieldAddress(fieldDefinition) ? (
        <AddressFieldInput
          onEnter={onEnter}
          onEscape={onEscape}
          onClickOutside={onClickOutside}
          onTab={onTab}
          onShiftTab={onShiftTab}
        />
      ) : isFieldRawJson(fieldDefinition) ? (
        <RawJsonFieldInput
          onEnter={onEnter}
          onEscape={onEscape}
          onClickOutside={onClickOutside}
          onTab={onTab}
          onShiftTab={onShiftTab}
        />
      ) : isFieldRichText(fieldDefinition) ? (
        <RichTextFieldInput />
      ) : (
        <></>
      )}
    </RecordFieldInputScope>
  );
};
