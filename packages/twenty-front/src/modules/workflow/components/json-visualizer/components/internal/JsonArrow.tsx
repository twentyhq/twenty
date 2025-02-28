import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { motion } from 'framer-motion';
import { IconChevronDown } from 'twenty-ui';

const StyledButton = styled(motion.button)`
  align-items: center;
  border-color: ${({ theme }) => theme.border.color.medium};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  border-style: solid;
  border-width: 1px;
  display: flex;
  justify-content: center;
  padding-inline: ${({ theme }) => theme.spacing(1)};
  background-color: ${({ theme }) => theme.background.transparent.lighter};
  height: 24px;
  width: 24px;
  box-sizing: border-box;
  cursor: pointer;
`;

const MotionIconChevronDown = motion(IconChevronDown);

export const JsonArrow = ({
  isOpen,
  onClick,
}: {
  isOpen: boolean;
  onClick: () => void;
}) => {
  const theme = useTheme();

  return (
    <StyledButton onClick={onClick}>
      <MotionIconChevronDown
        size={theme.icon.size.md}
        color={theme.font.color.secondary}
        initial={false}
        animate={{ rotate: isOpen ? -180 : 0 }}
      />
    </StyledButton>
  );
};
