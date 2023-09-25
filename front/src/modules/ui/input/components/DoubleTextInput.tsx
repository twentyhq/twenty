import { ChangeEvent, Ref } from 'react';
import styled from '@emotion/styled';

import { StyledInput } from './TextInput';

type OwnProps = {
  firstValue: string;
  secondValue: string;
  firstValuePlaceholder: string;
  secondValuePlaceholder: string;
  onChange: (firstValue: string, secondValue: string) => void;
  firstValueInputRef?: Ref<HTMLInputElement>;
  secondValueInputRef?: Ref<HTMLInputElement>;
  containerRef?: Ref<HTMLDivElement>;
};

const StyledContainer = styled.div`
  align-items: center;
  display: flex;
  justify-content: space-between;

  input {
    width: ${({ theme }) => theme.spacing(24)};
  }

  & > input:last-child {
    border-left: 1px solid ${({ theme }) => theme.border.color.medium};
    padding-left: ${({ theme }) => theme.spacing(2)};
  }
`;

export const DoubleTextInput = ({
  firstValue,
  secondValue,
  firstValuePlaceholder,
  secondValuePlaceholder,
  firstValueInputRef,
  secondValueInputRef,
  onChange,
  containerRef,
}: OwnProps) => {
  return (
    <StyledContainer ref={containerRef}>
      <StyledInput
        autoComplete="off"
        autoFocus
        placeholder={firstValuePlaceholder}
        ref={firstValueInputRef}
        value={firstValue}
        onChange={(event: ChangeEvent<HTMLInputElement>) => {
          onChange(event.target.value, secondValue);
        }}
      />
      <StyledInput
        autoComplete="off"
        placeholder={secondValuePlaceholder}
        ref={secondValueInputRef}
        value={secondValue}
        onChange={(event: ChangeEvent<HTMLInputElement>) => {
          onChange(firstValue, event.target.value);
        }}
      />
    </StyledContainer>
  );
};
