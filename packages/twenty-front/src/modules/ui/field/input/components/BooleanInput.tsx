import { useEffect, useState } from 'react';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { IconCheck, IconX } from 'twenty-ui';

const StyledEditableBooleanFieldContainer = styled.div`
  align-items: center;
  cursor: ${({ onClick }) => (onClick ? 'pointer' : 'default')};
  display: flex;

  height: 100%;
  width: 100%;
`;

const StyledEditableBooleanFieldValue = styled.div`
  margin-left: ${({ theme }) => theme.spacing(1)};
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

  const theme = useTheme();

  return (
    <StyledEditableBooleanFieldContainer
      onClick={readonly ? undefined : handleClick}
      data-testid={testId}
    >
      {internalValue ? (
        <IconCheck size={theme.icon.size.sm} />
      ) : (
        <IconX size={theme.icon.size.sm} />
      )}
      <StyledEditableBooleanFieldValue>
        {internalValue ? 'True' : 'False'}
      </StyledEditableBooleanFieldValue>
    </StyledEditableBooleanFieldContainer>
  );
};
