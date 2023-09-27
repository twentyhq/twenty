import { useContext } from 'react';

import { RecoilScope } from '@/ui/utilities/recoil-scope/components/RecoilScope';

import { FieldContext } from '../contexts/FieldContext';
import { BooleanFieldInput } from '../meta-types/input/components/BooleanFieldInput';
import { ChipFieldInput } from '../meta-types/input/components/ChipFieldInput';
import { DateFieldInput } from '../meta-types/input/components/DateFieldInput';
import { DoubleTextChipFieldInput } from '../meta-types/input/components/DoubleTextChipFieldInput';
import { DoubleTextFieldInput } from '../meta-types/input/components/DoubleTextFieldInput';
import { EmailFieldInput } from '../meta-types/input/components/EmailFieldInput';
import { MoneyFieldInput } from '../meta-types/input/components/MoneyFieldInput';
import { NumberFieldInput } from '../meta-types/input/components/NumberFieldInput';
import { PhoneFieldInput } from '../meta-types/input/components/PhoneFieldInput';
import { ProbabilityFieldInput } from '../meta-types/input/components/ProbabilityFieldInput';
import { RelationFieldInput } from '../meta-types/input/components/RelationFieldInput';
import { TextFieldInput } from '../meta-types/input/components/TextFieldInput';
import { URLFieldInput } from '../meta-types/input/components/URLFieldInput';
import { FieldInputEvent } from '../types/FieldInputEvent';
import { isFieldBoolean } from '../types/guards/isFieldBoolean';
import { isFieldChip } from '../types/guards/isFieldChip';
import { isFieldDate } from '../types/guards/isFieldDate';
import { isFieldDoubleText } from '../types/guards/isFieldDoubleText';
import { isFieldDoubleTextChip } from '../types/guards/isFieldDoubleTextChip';
import { isFieldEmail } from '../types/guards/isFieldEmail';
import { isFieldMoney } from '../types/guards/isFieldMoney';
import { isFieldNumber } from '../types/guards/isFieldNumber';
import { isFieldPhone } from '../types/guards/isFieldPhone';
import { isFieldProbability } from '../types/guards/isFieldProbability';
import { isFieldRelation } from '../types/guards/isFieldRelation';
import { isFieldText } from '../types/guards/isFieldText';
import { isFieldURL } from '../types/guards/isFieldURL';

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
      ) : isFieldDate(fieldDefinition) ? (
        <DateFieldInput
          onEnter={onEnter}
          onEscape={onEscape}
          onClickOutside={onClickOutside}
          onTab={onTab}
          onShiftTab={onShiftTab}
        />
      ) : isFieldNumber(fieldDefinition) ? (
        <NumberFieldInput
          onEnter={onEnter}
          onEscape={onEscape}
          onClickOutside={onClickOutside}
          onTab={onTab}
          onShiftTab={onShiftTab}
        />
      ) : isFieldURL(fieldDefinition) ? (
        <URLFieldInput
          onEnter={onEnter}
          onEscape={onEscape}
          onClickOutside={onClickOutside}
          onTab={onTab}
          onShiftTab={onShiftTab}
        />
      ) : isFieldPhone(fieldDefinition) ? (
        <PhoneFieldInput
          onEnter={onEnter}
          onEscape={onEscape}
          onClickOutside={onClickOutside}
          onTab={onTab}
          onShiftTab={onShiftTab}
        />
      ) : isFieldBoolean(fieldDefinition) ? (
        <BooleanFieldInput onSubmit={onSubmit} />
      ) : isFieldProbability(fieldDefinition) ? (
        <ProbabilityFieldInput onSubmit={onSubmit} />
      ) : isFieldChip(fieldDefinition) ? (
        <ChipFieldInput
          onEnter={onEnter}
          onEscape={onEscape}
          onClickOutside={onClickOutside}
          onTab={onTab}
          onShiftTab={onShiftTab}
        />
      ) : isFieldDoubleTextChip(fieldDefinition) ? (
        <DoubleTextChipFieldInput
          onEnter={onEnter}
          onEscape={onEscape}
          onClickOutside={onClickOutside}
          onTab={onTab}
          onShiftTab={onShiftTab}
        />
      ) : isFieldDoubleText(fieldDefinition) ? (
        <DoubleTextFieldInput
          onEnter={onEnter}
          onEscape={onEscape}
          onClickOutside={onClickOutside}
          onTab={onTab}
          onShiftTab={onShiftTab}
        />
      ) : isFieldMoney(fieldDefinition) ? (
        <MoneyFieldInput
          onEnter={onEnter}
          onEscape={onEscape}
          onClickOutside={onClickOutside}
          onTab={onTab}
          onShiftTab={onShiftTab}
        />
      ) : (
        <></>
      )}
    </>
  );
};
