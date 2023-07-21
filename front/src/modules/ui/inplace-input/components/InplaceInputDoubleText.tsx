import { ChangeEvent } from 'react';
import styled from '@emotion/styled';

import { InplaceInputTextEditMode } from '@/ui/inplace-input/components/InplaceInputTextEditMode';

type OwnProps = {
  firstValue: string;
  secondValue: string;
  firstValuePlaceholder: string;
  secondValuePlaceholder: string;
  onChange: (firstValue: string, secondValue: string) => void;
  isTitle?: boolean;
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
  isTitle,
}: OwnProps) {
  return (
    <StyledContainer>
      <InplaceInputTextEditMode
        autoFocus
        placeholder={firstValuePlaceholder}
        value={firstValue}
        onChange={(event: ChangeEvent<HTMLInputElement>) => {
          onChange(event.target.value, secondValue);
        }}
        isTitle={isTitle}
      />
      <InplaceInputTextEditMode
        placeholder={secondValuePlaceholder}
        value={secondValue}
        onChange={(event: ChangeEvent<HTMLInputElement>) => {
          onChange(firstValue, event.target.value);
        }}
        isTitle={isTitle}
      />
    </StyledContainer>
  );
}
