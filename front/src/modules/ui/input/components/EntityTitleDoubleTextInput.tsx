import { ChangeEvent } from 'react';
import styled from '@emotion/styled';

import { StyledInput } from '@/ui/input/components/TextInput';
import { ComputeNodeDimensions } from '@/ui/utilities/dimensions/components/ComputeNodeDimensions';

export type EntityTitleDoubleTextInputProps = {
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

export const EntityTitleDoubleTextInput = ({
  firstValue,
  secondValue,
  firstValuePlaceholder,
  secondValuePlaceholder,
  onChange,
}: EntityTitleDoubleTextInputProps) => (
  <StyledDoubleTextContainer>
    <ComputeNodeDimensions node={firstValue || firstValuePlaceholder}>
      {(nodeDimensions) => (
        <StyledTextInput
          width={nodeDimensions?.width}
          placeholder={firstValuePlaceholder}
          value={firstValue}
          onChange={(event: ChangeEvent<HTMLInputElement>) => {
            onChange(event.target.value, secondValue);
          }}
        />
      )}
    </ComputeNodeDimensions>
    <ComputeNodeDimensions node={secondValue || secondValuePlaceholder}>
      {(nodeDimensions) => (
        <StyledTextInput
          width={nodeDimensions?.width}
          autoComplete="off"
          placeholder={secondValuePlaceholder}
          value={secondValue}
          onChange={(event: ChangeEvent<HTMLInputElement>) => {
            onChange(firstValue, event.target.value);
          }}
        />
      )}
    </ComputeNodeDimensions>
  </StyledDoubleTextContainer>
);
