import React, { useEffect, useState } from 'react';
import styled from '@emotion/styled';
import { motion } from 'framer-motion';

type ContainerProps = {
  isOn: boolean;
  color?: string;
};

const StyledContainer = styled.div<ContainerProps>`
  align-items: center;
  background-color: ${({ theme, isOn, color }) =>
    isOn ? color ?? theme.color.blue : theme.background.quaternary};
  border-radius: 10px;
  cursor: pointer;
  display: flex;
  height: 20px;
  transition: background-color 0.3s ease;
  width: 32px;
`;

const StyledCircle = styled(motion.div)`
  background-color: #fff;
  border-radius: 50%;
  height: 16px;
  width: 16px;
`;

const circleVariants = {
  on: { x: 14 },
  off: { x: 2 },
};

export type ToggleProps = {
  value?: boolean;
  onChange?: (value: boolean) => void;
  color?: string;
};

export function Toggle({ value, onChange, color }: ToggleProps) {
  const [isOn, setIsOn] = useState(value ?? false);

  function handleChange() {
    setIsOn(!isOn);

    if (onChange) {
      onChange(!isOn);
    }
  }

  useEffect(() => {
    if (value !== isOn) {
      setIsOn(value ?? false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return (
    <StyledContainer onClick={handleChange} isOn={isOn} color={color}>
      <StyledCircle animate={isOn ? 'on' : 'off'} variants={circleVariants} />
    </StyledContainer>
  );
}
