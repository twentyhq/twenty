import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { motion } from 'framer-motion';
import { IconGripVertical } from 'twenty-ui/display';

const StyledGripContainer = styled(motion.div)`
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: grab;
  user-select: none;
  border-radius: ${({ theme }) => theme.border.radius.sm};
  box-sizing: border-box;

  &:active {
    cursor: grabbing;
    background: ${({ theme }) => theme.background.tertiary};
  }

  &:hover {
    background: ${({ theme }) => theme.background.tertiary};
  }
`;

type WidgetGripProps = {
  className?: string;
  onClick?: (e: React.MouseEvent) => void;
};

export const WidgetGrip = ({ className, onClick }: WidgetGripProps) => {
  const theme = useTheme();

  return (
    <StyledGripContainer
      layout
      className={className}
      onClick={onClick}
      initial={{ width: 0, opacity: 0 }}
      animate={{ width: 20, opacity: 1 }}
      exit={{ width: 0, opacity: 0 }}
      transition={{
        duration: theme.animation.duration.fast,
        ease: 'easeInOut',
      }}
    >
      <IconGripVertical
        size={theme.icon.size.sm}
        color={theme.font.color.extraLight}
      />
    </StyledGripContainer>
  );
};
