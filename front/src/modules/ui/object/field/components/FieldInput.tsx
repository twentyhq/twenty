import { useContext } from 'react';

import { FullNameFieldInput } from '@/ui/object/field/meta-types/input/components/FullNameFieldInput';
import { isFieldFullName } from '@/ui/object/field/types/guards/isFieldFullName';
import { RecoilScope } from '@/ui/utilities/recoil-scope/components/RecoilScope';

import { FieldContext } from '../contexts/FieldContext';
import { BooleanFieldInput } from '../meta-types/input/components/BooleanFieldInput';
import { CurrencyFieldInput } from '../meta-types/input/components/CurrencyFieldInput';
import { DateFieldInput } from '../meta-types/input/components/DateFieldInput';
import { EmailFieldInput } from '../meta-types/input/components/EmailFieldInput';
import { LinkFieldInput } from '../meta-types/input/components/LinkFieldInput';
import { NumberFieldInput } from '../meta-types/input/components/NumberFieldInput';
import { PhoneFieldInput } from '../meta-types/input/components/PhoneFieldInput';
import { ProbabilityFieldInput } from '../meta-types/input/components/ProbabilityFieldInput';
import { RelationFieldInput } from '../meta-types/input/components/RelationFieldInput';
import { TextFieldInput } from '../meta-types/input/components/TextFieldInput';
import { FieldInputEvent } from '../types/FieldInputEvent';
import { isFieldBoolean } from '../types/guards/isFieldBoolean';
import { isFieldCurrency } from '../types/guards/isFieldCurrency';
import { isFieldDate } from '../types/guards/isFieldDate';
import { isFieldEmail } from '../types/guards/isFieldEmail';
import { isFieldLink } from '../types/guards/isFieldLink';
import { isFieldNumber } from '../types/guards/isFieldNumber';
import { isFieldPhone } from '../types/guards/isFieldPhone';
import { isFieldProbability } from '../types/guards/isFieldProbability';
import { isFieldRelation } from '../types/guards/isFieldRelation';
import { isFieldText } from '../types/guards/isFieldText';

type FieldInputProps = {
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
}: FieldInputProps) => {
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
      ) : isFieldFullName(fieldDefinition) ? (
        <FullNameFieldInput
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
      ) : (
        <></>
      )}
    </>
  );
};
