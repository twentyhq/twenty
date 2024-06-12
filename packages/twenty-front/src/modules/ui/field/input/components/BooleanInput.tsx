import { useEffect, useState } from 'react';
import styled from '@emotion/styled';

import { BooleanDisplay } from '@/ui/field/display/components/BooleanDisplay';

const StyledEditableBooleanFieldContainer = styled.div`
  align-items: center;
  cursor: ${({ onClick }) => (onClick ? 'pointer' : 'default')};
  display: flex;

  height: 100%;
  width: 100%;
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
      data-testid={testId}
    >
      <BooleanDisplay value={internalValue} />
    </StyledEditableBooleanFieldContainer>
  );
};
