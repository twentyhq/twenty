import { useContext } from 'react';

import { AddressFieldInput } from '@/object-record/record-field/meta-types/input/components/AddressFieldInput';
import { DateFieldInput } from '@/object-record/record-field/meta-types/input/components/DateFieldInput';
import { EmailsFieldInput } from '@/object-record/record-field/meta-types/input/components/EmailsFieldInput';
import { FullNameFieldInput } from '@/object-record/record-field/meta-types/input/components/FullNameFieldInput';
import { LinksFieldInput } from '@/object-record/record-field/meta-types/input/components/LinksFieldInput';
import { MultiSelectFieldInput } from '@/object-record/record-field/meta-types/input/components/MultiSelectFieldInput';
import { PhonesFieldInput } from '@/object-record/record-field/meta-types/input/components/PhonesFieldInput';
import { RawJsonFieldInput } from '@/object-record/record-field/meta-types/input/components/RawJsonFieldInput';
import { RelationFromManyFieldInput } from '@/object-record/record-field/meta-types/input/components/RelationFromManyFieldInput';
import { SelectFieldInput } from '@/object-record/record-field/meta-types/input/components/SelectFieldInput';
import { RecordFieldInputScope } from '@/object-record/record-field/scopes/RecordFieldInputScope';
import { isFieldPhones } from '@/object-record/record-field/types/guards/isFieldPhones';
import { isFieldRelationFromManyObjects } from '@/object-record/record-field/types/guards/isFieldRelationFromManyObjects';
import { isFieldRelationToOneObject } from '@/object-record/record-field/types/guards/isFieldRelationToOneObject';
import { getScopeIdFromComponentId } from '@/ui/utilities/recoil-scope/utils/getScopeIdFromComponentId';

import { ArrayFieldInput } from '@/object-record/record-field/meta-types/input/components/ArrayFieldInput';
import { isFieldAddress } from '@/object-record/record-field/types/guards/isFieldAddress';
import { isFieldArray } from '@/object-record/record-field/types/guards/isFieldArray';
import { isFieldBoolean } from '@/object-record/record-field/types/guards/isFieldBoolean';
import { isFieldCurrency } from '@/object-record/record-field/types/guards/isFieldCurrency';
import { isFieldDate } from '@/object-record/record-field/types/guards/isFieldDate';
import { isFieldDateTime } from '@/object-record/record-field/types/guards/isFieldDateTime';
import { isFieldEmails } from '@/object-record/record-field/types/guards/isFieldEmails';
import { isFieldFullName } from '@/object-record/record-field/types/guards/isFieldFullName';
import { isFieldLinks } from '@/object-record/record-field/types/guards/isFieldLinks';
import { isFieldMultiSelect } from '@/object-record/record-field/types/guards/isFieldMultiSelect';
import { isFieldNumber } from '@/object-record/record-field/types/guards/isFieldNumber';
import { isFieldRating } from '@/object-record/record-field/types/guards/isFieldRating';
import { isFieldRawJson } from '@/object-record/record-field/types/guards/isFieldRawJson';
import { isFieldSelect } from '@/object-record/record-field/types/guards/isFieldSelect';
import { FieldContext } from '../contexts/FieldContext';
import { BooleanFieldInput } from '../meta-types/input/components/BooleanFieldInput';
import { CurrencyFieldInput } from '../meta-types/input/components/CurrencyFieldInput';
import { DateTimeFieldInput } from '../meta-types/input/components/DateTimeFieldInput';
import { NumberFieldInput } from '../meta-types/input/components/NumberFieldInput';
import { RatingFieldInput } from '../meta-types/input/components/RatingFieldInput';
import { RelationToOneFieldInput } from '../meta-types/input/components/RelationToOneFieldInput';
import { TextFieldInput } from '../meta-types/input/components/TextFieldInput';
import { FieldInputEvent } from '../types/FieldInputEvent';
import { isFieldText } from '../types/guards/isFieldText';

type FieldInputProps = {
  recordFieldInputdId: string;
  onSubmit?: FieldInputEvent;
  onCancel?: () => void;
  onClickOutside?: (
    persist: () => void,
    event: MouseEvent | TouchEvent,
  ) => void;
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
      ) : isFieldPhones(fieldDefinition) ? (
        <PhonesFieldInput
          onCancel={onCancel}
          onClickOutside={(event) => onClickOutside?.(() => {}, event)}
        />
      ) : isFieldText(fieldDefinition) ? (
        <TextFieldInput
          onEnter={onEnter}
          onEscape={onEscape}
          onClickOutside={onClickOutside}
          onTab={onTab}
          onShiftTab={onShiftTab}
        />
      ) : isFieldEmails(fieldDefinition) ? (
        <EmailsFieldInput
          onCancel={onCancel}
          onClickOutside={(event) => onClickOutside?.(() => {}, event)}
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
      ) : isFieldLinks(fieldDefinition) ? (
        <LinksFieldInput
          onCancel={onCancel}
          onClickOutside={(event) => onClickOutside?.(() => {}, event)}
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
      ) : isFieldArray(fieldDefinition) ? (
        <ArrayFieldInput
          onCancel={onCancel}
          onClickOutside={(event) => onClickOutside?.(() => {}, event)}
        />
      ) : (
        <></>
      )}
    </RecordFieldInputScope>
  );
};
