import { useEffect, useState } from 'react';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';

import { IconCheck, IconX } from '@/ui/icon';

const StyledEditableBooleanFieldContainer = styled.div`
  align-items: center;
  cursor: pointer;
  display: flex;

  height: 100%;
  width: 100%;
`;

const StyledEditableBooleanFieldValue = styled.div`
  margin-left: ${({ theme }) => theme.spacing(1)};
`;

type OwnProps = {
  value: boolean;
  onToggle?: (newValue: boolean) => void;
};

export const BooleanInput = ({ value, onToggle }: OwnProps) => {
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
    <StyledEditableBooleanFieldContainer onClick={handleClick}>
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
