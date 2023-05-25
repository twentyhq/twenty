import styled from '@emotion/styled';
import { ChangeEvent, useRef } from 'react';

type OwnProps = {
  leftValue: string;
  rightValue: string;
  leftValuePlaceholder: string;
  rightValuePlaceholder: string;
  onChange: (leftValue: string, rightValue: string) => void;
};

const StyledContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;

  & > input:last-child {
    padding-left: ${(props) => props.theme.spacing(2)};
    border-left: 1px solid ${(props) => props.theme.primaryBorder};
  }
`;

const StyledEditInplaceInput = styled.input`
  width: 45%;
  border: none;
  outline: none;
  height: 18px;

  &::placeholder {
    font-weight: bold;
    color: ${(props) => props.theme.text20};
  }
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
