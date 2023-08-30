import { ChangeEvent } from 'react';
import styled from '@emotion/styled';

import { StyledInput } from '@/ui/table/editable-cell/type/components/TextCellEdit';
import { TemplateDimensionsEffect } from '@/ui/utilities/dimensions/components/TemplateDimensionsEffect';

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

const StyledTextInput = styled(StyledInput)`
  margin: 0 ${({ theme }) => theme.spacing(0.5)};
  padding: 0;
  width: ${({ width }) => (width ? `${width}px` : 'auto')};

  &:hover:not(:focus) {
    background-color: ${({ theme }) => theme.background.transparent.light};
    border-radius: ${({ theme }) => theme.border.radius.sm};
    cursor: pointer;
    padding: 0 ${({ theme }) => theme.spacing(1)};
  }
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
      <TemplateDimensionsEffect template={firstValue || firstValuePlaceholder}>
        {(contentDimensions) => (
          <StyledTextInput
            width={contentDimensions?.width}
            autoFocus
            placeholder={firstValuePlaceholder}
            value={firstValue}
            onChange={(event: ChangeEvent<HTMLInputElement>) => {
              onChange(event.target.value, secondValue);
            }}
          />
        )}
      </TemplateDimensionsEffect>
      <TemplateDimensionsEffect
        template={secondValue || secondValuePlaceholder}
      >
        {(contentDimensions) => (
          <StyledTextInput
            width={contentDimensions?.width}
            autoComplete="off"
            placeholder={secondValuePlaceholder}
            value={secondValue}
            onChange={(event: ChangeEvent<HTMLInputElement>) => {
              onChange(firstValue, event.target.value);
            }}
          />
        )}
      </TemplateDimensionsEffect>
    </StyledDoubleTextContainer>
  );
}
