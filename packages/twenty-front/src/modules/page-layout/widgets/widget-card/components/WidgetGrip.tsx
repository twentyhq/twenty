import { styled } from '@linaria/react';
import { motion } from 'framer-motion';
import { IconGripVertical } from 'twenty-ui/display';
import { themeCssVariables, ThemeContext } from 'twenty-ui/theme-constants';
import { useContext } from 'react';

const StyledGripContainerBase = styled.div`
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: grab;
  user-select: none;
  border-radius: ${themeCssVariables.border.radius.sm};
  box-sizing: border-box;

  &:active {
    cursor: grabbing;
    background: ${themeCssVariables.background.tertiary};
  }

  &:hover {
    background: ${themeCssVariables.background.tertiary};
  }
`;
const StyledGripContainer = motion.create(StyledGripContainerBase);

type WidgetGripProps = {
  className?: string;
  onClick?: (e: React.MouseEvent) => void;
};

export const WidgetGrip = ({ className, onClick }: WidgetGripProps) => {
  const { theme } = useContext(ThemeContext);
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
