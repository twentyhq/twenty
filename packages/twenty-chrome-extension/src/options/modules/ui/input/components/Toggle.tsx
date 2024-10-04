import { useEffect, useState } from 'react';
import styled from '@emotion/styled';
import { motion } from 'framer-motion';

import { isDefined } from '~/utils/isDefined';

export type ToggleSize = 'small' | 'medium';

type ContainerProps = {
  isOn: boolean;
  color?: string;
  toggleSize: ToggleSize;
};

const StyledContainer = styled.div<ContainerProps>`
  align-items: center;
  background-color: ${({ theme, isOn, color }) =>
    isOn ? (color ?? theme.color.blue) : theme.background.quaternary};
  border-radius: 10px;
  cursor: pointer;
  display: flex;
  height: ${({ toggleSize }) => (toggleSize === 'small' ? 16 : 20)}px;
  transition: background-color 0.3s ease;
  width: ${({ toggleSize }) => (toggleSize === 'small' ? 24 : 32)}px;
`;

const StyledCircle = styled(motion.div)<{
  toggleSize: ToggleSize;
}>`
  background-color: ${({ theme }) => theme.background.primary};
  border-radius: 50%;
  height: ${({ toggleSize }) => (toggleSize === 'small' ? 12 : 16)}px;
  width: ${({ toggleSize }) => (toggleSize === 'small' ? 12 : 16)}px;
`;

export type ToggleProps = {
  value?: boolean;
  onChange?: (value: boolean) => void;
  color?: string;
  toggleSize?: ToggleSize;
};

export const Toggle = ({
  value,
  onChange,
  color,
  toggleSize = 'medium',
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
    if (value !== isOn) {
      setIsOn(value ?? false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return (
    <StyledContainer
      onClick={handleChange}
      isOn={isOn}
      color={color}
      toggleSize={toggleSize}
    >
      <StyledCircle
        animate={isOn ? 'on' : 'off'}
        variants={circleVariants}
        toggleSize={toggleSize}
      />
    </StyledContainer>
  );
};
