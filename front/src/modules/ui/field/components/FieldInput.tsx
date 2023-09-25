import { useContext } from 'react';

import { RecoilScope } from '@/ui/utilities/recoil-scope/components/RecoilScope';

import { FieldContext } from '../contexts/FieldContext';
import { DateFieldInput } from '../meta-types/input/components/DateFieldInput';
import { NumberFieldInput } from '../meta-types/input/components/NumberFieldInput';
import { PhoneFieldInput } from '../meta-types/input/components/PhoneFieldInput';
import { RelationFieldInput } from '../meta-types/input/components/RelationFieldInput';
import { TextFieldInput } from '../meta-types/input/components/TextFieldInput';
import { URLFieldInput } from '../meta-types/input/components/URLFieldInput';
import { isFieldDate } from '../types/guards/isFieldDate';
import { isFieldNumber } from '../types/guards/isFieldNumber';
import { isFieldPhone } from '../types/guards/isFieldPhone';
import { isFieldRelation } from '../types/guards/isFieldRelation';
import { isFieldText } from '../types/guards/isFieldText';
import { isFieldURL } from '../types/guards/isFieldURL';

export type FieldInputEvent = (persist: () => void) => void;

type OwnProps = {
  onSubmit?: FieldInputEvent;
  onCancel?: () => void;
  onClickOutside?: FieldInputEvent;
  onEnter?: FieldInputEvent;
  onEscape?: FieldInputEvent;
  onTab?: FieldInputEvent;
  onShiftTab?: FieldInputEvent;
};

export const FieldInput = ({
  onCancel,
  onSubmit,
  onEnter,
  onEscape,
  onShiftTab,
  onTab,
  onClickOutside,
}: OwnProps) => {
  const { fieldDefinition } = useContext(FieldContext);

  return (
    <>
      {isFieldRelation(fieldDefinition) ? (
        <RecoilScope>
          <RelationFieldInput onSubmit={onSubmit} onCancel={onCancel} />
        </RecoilScope>
      ) : isFieldText(fieldDefinition) ? (
        <TextFieldInput
          {...{
            onEnter,
            onEscape,
            onClickOutside,
            onTab,
            onShiftTab,
          }}
        />
      ) : isFieldDate(fieldDefinition) ? (
        <DateFieldInput
          {...{
            onEnter,
            onEscape,
            onClickOutside,
            onTab,
            onShiftTab,
          }}
        />
      ) : isFieldNumber(fieldDefinition) ? (
        <NumberFieldInput
          {...{
            onEnter,
            onEscape,
            onClickOutside,
            onTab,
            onShiftTab,
          }}
        />
      ) : isFieldURL(fieldDefinition) ? (
        <URLFieldInput
          {...{
            onEnter,
            onEscape,
            onClickOutside,
            onTab,
            onShiftTab,
          }}
        />
      ) : isFieldPhone(fieldDefinition) ? (
        <PhoneFieldInput
          {...{
            onEnter,
            onEscape,
            onClickOutside,
            onTab,
            onShiftTab,
          }}
        />
      ) : (
        <></>
      )}
    </>
  );
};
