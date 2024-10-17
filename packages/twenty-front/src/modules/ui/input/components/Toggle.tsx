import styled from '@emotion/styled';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

import { isDefined } from '~/utils/isDefined';

export type ToggleSize = 'small' | 'medium';

type ContainerProps = {
  isOn: boolean;
  color?: string;
  toggleSize: ToggleSize;
  disabled?: boolean;
};

const StyledContainer = styled.div<ContainerProps>`
  align-items: center;
  background-color: ${({ theme, isOn, color }) =>
    isOn ? (color ?? theme.color.blue) : theme.background.transparent.medium};
  border-radius: 10px;
  cursor: pointer;
  display: flex;
  height: ${({ toggleSize }) => (toggleSize === 'small' ? 16 : 20)}px;
  transition: background-color 0.3s ease;
  width: ${({ toggleSize }) => (toggleSize === 'small' ? 24 : 32)}px;
  opacity: ${({ disabled }) => (disabled ? 0.5 : 1)};
  pointer-events: ${({ disabled }) => (disabled ? 'none' : 'auto')};
`;

const StyledCircle = styled(motion.div)<{
  size: ToggleSize;
}>`
  background-color: ${({ theme }) => theme.background.primary};
  border-radius: 50%;
  height: ${({ size }) => (size === 'small' ? 12 : 16)}px;
  width: ${({ size }) => (size === 'small' ? 12 : 16)}px;
`;

export type ToggleProps = {
  value?: boolean;
  onChange?: (value: boolean) => void;
  color?: string;
  toggleSize?: ToggleSize;
  className?: string;
  disabled?: boolean;
};

export const Toggle = ({
  value,
  onChange,
  color,
  toggleSize = 'medium',
  className,
  disabled,
}: ToggleProps) => {
  const [isOn, setIsOn] = useState(value ?? false);

  const circleVariants = {
    on: { x: toggleSize === 'small' ? 10 : 14 },
    off: { x: 2 },
  };

  const handleChange = () => {
    setIsOn(!isOn);

    if (isDefined(onChange)) {
      onChange(!isOn);
    }
  };

  useEffect(() => {
    setIsOn((isOn) => {
      if (value !== isOn) {
        return value ?? false;
      }

      return isOn;
    });
  }, [value, setIsOn]);

  return (
    <StyledContainer
      onClick={handleChange}
      isOn={isOn}
      color={color}
      toggleSize={toggleSize}
      className={className}
      disabled={disabled}
    >
      <StyledCircle
        animate={isOn ? 'on' : 'off'}
        variants={circleVariants}
        size={toggleSize}
      />
    </StyledContainer>
  );
};
