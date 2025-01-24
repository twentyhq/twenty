import styled from '@emotion/styled';
import { useEffect, useState } from 'react';

import { BooleanDisplay } from '@/ui/field/display/components/BooleanDisplay';

const StyledEditableBooleanFieldContainer = styled.div<{ readonly?: boolean }>`
  align-items: center;
  cursor: ${({ onClick }) => (onClick ? 'pointer' : 'default')};
  display: flex;

  height: 100%;
  width: 100%;

  color: ${({ theme, readonly }) =>
    readonly ? theme.font.color.tertiary : theme.font.color.primary};
`;

type BooleanInputProps = {
  value: boolean;
  onToggle?: (newValue: boolean) => void;
  readonly?: boolean;
  testId?: string;
};

export const BooleanInput = ({
  value,
  onToggle,
  readonly,
  testId,
}: BooleanInputProps) => {
  const [internalValue, setInternalValue] = useState(value);

  useEffect(() => {
    setInternalValue(value);
  }, [value]);

  const handleClick = () => {
    setInternalValue(!internalValue);
    onToggle?.(!internalValue);
  };

  return (
    <StyledEditableBooleanFieldContainer
      onClick={readonly ? undefined : handleClick}
      readonly={readonly}
      data-testid={testId}
    >
      <BooleanDisplay value={internalValue} />
    </StyledEditableBooleanFieldContainer>
  );
};
