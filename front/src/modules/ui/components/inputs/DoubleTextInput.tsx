import { ChangeEvent, useRef } from 'react';
import styled from '@emotion/styled';

type OwnProps = {
  leftValue: string;
  rightValue: string;
  leftValuePlaceholder: string;
  rightValuePlaceholder: string;
  onChange: (leftValue: string, rightValue: string) => void;
};

const StyledContainer = styled.div`
  align-items: center;
  display: flex;
  justify-content: space-between;

  & > input:last-child {
    border-left: 1px solid ${({ theme }) => theme.border.color.light};
    padding-left: ${({ theme }) => theme.spacing(2)};
  }
`;

const StyledEditInplaceInput = styled.input`
  height: 18px;
  width: 45%;
`;

export function DoubleTextInput({
  leftValue,
  rightValue,
  leftValuePlaceholder,
  rightValuePlaceholder,
  onChange,
}: OwnProps) {
  const firstValueInputRef = useRef<HTMLInputElement>(null);

  return (
    <StyledContainer>
      <StyledEditInplaceInput
        autoFocus
        placeholder={leftValuePlaceholder}
        ref={firstValueInputRef}
        value={leftValue}
        onChange={(event: ChangeEvent<HTMLInputElement>) => {
          onChange(event.target.value, rightValue);
        }}
      />
      <StyledEditInplaceInput
        placeholder={rightValuePlaceholder}
        ref={firstValueInputRef}
        value={rightValue}
        onChange={(event: ChangeEvent<HTMLInputElement>) => {
          onChange(leftValue, event.target.value);
        }}
      />
    </StyledContainer>
  );
}
