import { useContext } from 'react';

import { AddressFieldInput } from '@/object-record/record-field/meta-types/input/components/AddressFieldInput';
import { DateFieldInput } from '@/object-record/record-field/meta-types/input/components/DateFieldInput';
import { FullNameFieldInput } from '@/object-record/record-field/meta-types/input/components/FullNameFieldInput';
import { MultiSelectFieldInput } from '@/object-record/record-field/meta-types/input/components/MultiSelectFieldInput.tsx';
import { RawJsonFieldInput } from '@/object-record/record-field/meta-types/input/components/RawJsonFieldInput';
import { SelectFieldInput } from '@/object-record/record-field/meta-types/input/components/SelectFieldInput';
import { RecordFieldInputScope } from '@/object-record/record-field/scopes/RecordFieldInputScope';
import { isFieldDate } from '@/object-record/record-field/types/guards/isFieldDate';
import { isFieldFullName } from '@/object-record/record-field/types/guards/isFieldFullName';
import { isFieldMultiSelect } from '@/object-record/record-field/types/guards/isFieldMultiSelect.ts';
import { isFieldRawJson } from '@/object-record/record-field/types/guards/isFieldRawJson';
import { isFieldSelect } from '@/object-record/record-field/types/guards/isFieldSelect';
import { getScopeIdFromComponentId } from '@/ui/utilities/recoil-scope/utils/getScopeIdFromComponentId';

import { FieldContext } from '../contexts/FieldContext';
import { BooleanFieldInput } from '../meta-types/input/components/BooleanFieldInput';
import { CurrencyFieldInput } from '../meta-types/input/components/CurrencyFieldInput';
import { DateTimeFieldInput } from '../meta-types/input/components/DateTimeFieldInput';
import { EmailFieldInput } from '../meta-types/input/components/EmailFieldInput';
import { LinkFieldInput } from '../meta-types/input/components/LinkFieldInput';
import { NumberFieldInput } from '../meta-types/input/components/NumberFieldInput';
import { PhoneFieldInput } from '../meta-types/input/components/PhoneFieldInput';
import { RatingFieldInput } from '../meta-types/input/components/RatingFieldInput';
import { RelationFieldInput } from '../meta-types/input/components/RelationFieldInput';
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
import { isFieldRelation } from '../types/guards/isFieldRelation';
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
      {isFieldRelation(fieldDefinition) ? (
        <RelationFieldInput onSubmit={onSubmit} onCancel={onCancel} />
      ) : isFieldPhone(fieldDefinition) ? (
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
        />
      ) : isFieldDate(fieldDefinition) ? (
        <DateFieldInput
          onEnter={onEnter}
          onEscape={onEscape}
          onClickOutside={onClickOutside}
          onClear={onSubmit}
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
      ) : (
        <></>
      )}
    </RecordFieldInputScope>
  );
};
