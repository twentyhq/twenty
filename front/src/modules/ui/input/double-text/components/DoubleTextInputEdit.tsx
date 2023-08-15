import { ChangeEvent } from 'react';
import styled from '@emotion/styled';

import { StyledInput } from '@/ui/table/editable-cell/type/components/TextCellEdit';

export type DoubleTextInputEditProps = {
  firstValue: string;
  secondValue: string;
  firstValuePlaceholder: string;
  secondValuePlaceholder: string;
  onChange: (firstValue: string, secondValue: string) => void;
};

const StyledDoubleTextContainer = styled.div`
  align-items: center;
  display: flex;
  justify-content: center;
  text-align: center;
`;

const StyledNameInput = styled(StyledInput)`
  padding: 0;
  text-align: center;
  width: auto;
`;

export function DoubleTextInputEdit({
  firstValue,
  secondValue,
  firstValuePlaceholder,
  secondValuePlaceholder,
  onChange,
}: DoubleTextInputEditProps) {
  return (
    <StyledDoubleTextContainer>
      <StyledNameInput
        size={firstValue.length}
        autoFocus
        placeholder={firstValuePlaceholder}
        value={firstValue}
        onChange={(event: ChangeEvent<HTMLInputElement>) => {
          onChange(event.target.value, secondValue);
        }}
      />
      <StyledNameInput
        size={secondValue.length}
        autoComplete="off"
        placeholder={secondValuePlaceholder}
        value={secondValue}
        onChange={(event: ChangeEvent<HTMLInputElement>) => {
          onChange(firstValue, event.target.value);
        }}
      />
    </StyledDoubleTextContainer>
  );
}
