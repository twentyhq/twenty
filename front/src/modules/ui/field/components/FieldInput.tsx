import { useContext } from 'react';

import { TableFloatingCellContainer } from '@/ui/data-table/table-cell/components/TableFloatingCellContainer';
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
        <TableFloatingCellContainer>
          <TextFieldInput
            onEnter={onEnter}
            onEscape={onEscape}
            onClickOutside={onClickOutside}
            onTab={onTab}
            onShiftTab={onShiftTab}
          />
        </TableFloatingCellContainer>
      ) : isFieldEmail(fieldDefinition) ? (
        <TableFloatingCellContainer>
          <EmailFieldInput
            onEnter={onEnter}
            onEscape={onEscape}
            onClickOutside={onClickOutside}
            onTab={onTab}
            onShiftTab={onShiftTab}
          />
        </TableFloatingCellContainer>
      ) : isFieldDate(fieldDefinition) ? (
        <DateFieldInput
          onEnter={onEnter}
          onEscape={onEscape}
          onClickOutside={onClickOutside}
          onTab={onTab}
          onShiftTab={onShiftTab}
        />
      ) : isFieldNumber(fieldDefinition) ? (
        <TableFloatingCellContainer>
          <NumberFieldInput
            onEnter={onEnter}
            onEscape={onEscape}
            onClickOutside={onClickOutside}
            onTab={onTab}
            onShiftTab={onShiftTab}
          />
        </TableFloatingCellContainer>
      ) : isFieldURL(fieldDefinition) ? (
        <TableFloatingCellContainer>
          <URLFieldInput
            onEnter={onEnter}
            onEscape={onEscape}
            onClickOutside={onClickOutside}
            onTab={onTab}
            onShiftTab={onShiftTab}
          />
        </TableFloatingCellContainer>
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
        <TableFloatingCellContainer>
          <ChipFieldInput
            onEnter={onEnter}
            onEscape={onEscape}
            onClickOutside={onClickOutside}
            onTab={onTab}
            onShiftTab={onShiftTab}
          />
        </TableFloatingCellContainer>
      ) : isFieldDoubleTextChip(fieldDefinition) ? (
        <TableFloatingCellContainer>
          <DoubleTextChipFieldInput
            onEnter={onEnter}
            onEscape={onEscape}
            onClickOutside={onClickOutside}
            onTab={onTab}
            onShiftTab={onShiftTab}
          />
        </TableFloatingCellContainer>
      ) : isFieldDoubleText(fieldDefinition) ? (
        <TableFloatingCellContainer>
          <DoubleTextFieldInput
            onEnter={onEnter}
            onEscape={onEscape}
            onClickOutside={onClickOutside}
            onTab={onTab}
            onShiftTab={onShiftTab}
          />
        </TableFloatingCellContainer>
      ) : isFieldMoney(fieldDefinition) ? (
        <TableFloatingCellContainer>
          <MoneyFieldInput
            onEnter={onEnter}
            onEscape={onEscape}
            onClickOutside={onClickOutside}
            onTab={onTab}
            onShiftTab={onShiftTab}
          />
        </TableFloatingCellContainer>
      ) : (
        <></>
      )}
    </>
  );
};
