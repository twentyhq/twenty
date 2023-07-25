import { ChangeEvent } from 'react';
import styled from '@emotion/styled';

import { StyledInput } from '@/ui/inplace-input/components/InplaceInputTextEditMode';

type OwnProps = {
  firstValue: string;
  secondValue: string;
  firstValuePlaceholder: string;
  secondValuePlaceholder: string;
  onChange: (firstValue: string, secondValue: string) => void;
};

const StyledContainer = styled.div`
  align-items: center;
  display: flex;
  justify-content: space-between;

  & > input:last-child {
    border-left: 1px solid ${({ theme }) => theme.border.color.medium};
    padding-left: ${({ theme }) => theme.spacing(2)};
  }
`;

export function InplaceInputDoubleText({
  firstValue,
  secondValue,
  firstValuePlaceholder,
  secondValuePlaceholder,
  onChange,
}: OwnProps) {
  return (
    <StyledContainer>
      <StyledInput
        autoFocus
        placeholder={firstValuePlaceholder}
        value={firstValue}
        onChange={(event: ChangeEvent<HTMLInputElement>) => {
          onChange(event.target.value, secondValue);
        }}
      />
      <InplaceInputTextEditMode
        autoComplete="off"
      <StyledInput
        autoComplete="off"
        placeholder={secondValuePlaceholder}
        value={secondValue}
        onChange={(event: ChangeEvent<HTMLInputElement>) => {
          onChange(firstValue, event.target.value);
        }}
      />
    </StyledContainer>
  );
}
