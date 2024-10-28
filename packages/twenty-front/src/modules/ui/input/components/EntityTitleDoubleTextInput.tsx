import styled from '@emotion/styled';
import { ChangeEvent } from 'react';

import { StyledTextInput as UIStyledTextInput } from '@/ui/field/input/components/TextInput';
import { usePreviousHotkeyScope } from '@/ui/utilities/hotkey/hooks/usePreviousHotkeyScope';

import { ComputeNodeDimensions } from 'twenty-ui';
import { InputHotkeyScope } from '../types/InputHotkeyScope';

export type EntityTitleDoubleTextInputProps = {
  firstValue: string;
  secondValue: string;
  firstValuePlaceholder: string;
  secondValuePlaceholder: string;
  onChange: (firstValue: string, secondValue: string) => void;
  className?: string;
};

const StyledDoubleTextContainer = styled.div`
  align-items: center;
  display: flex;
  justify-content: center;
  text-align: center;
`;

const StyledTextInput = styled(UIStyledTextInput)`
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
  className,
}: EntityTitleDoubleTextInputProps) => {
  const {
    goBackToPreviousHotkeyScope,
    setHotkeyScopeAndMemorizePreviousScope,
  } = usePreviousHotkeyScope();
  const handleFocus = () => {
    setHotkeyScopeAndMemorizePreviousScope(InputHotkeyScope.TextInput);
  };
  const handleBlur = () => {
    goBackToPreviousHotkeyScope();
  };

  return (
    <StyledDoubleTextContainer className={className}>
      <ComputeNodeDimensions node={firstValue || firstValuePlaceholder}>
        {(nodeDimensions) => (
          <StyledTextInput
            width={nodeDimensions?.width}
            placeholder={firstValuePlaceholder}
            value={firstValue}
            onFocus={handleFocus}
            onBlur={handleBlur}
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
            onFocus={handleFocus}
            onChange={(event: ChangeEvent<HTMLInputElement>) => {
              onChange(firstValue, event.target.value);
            }}
          />
        )}
      </ComputeNodeDimensions>
    </StyledDoubleTextContainer>
  );
};
