import { styled } from '@linaria/react';
import { motion } from 'framer-motion';
import { isDefined } from 'twenty-shared/utils';
import { IconGripVertical } from 'twenty-ui/icon';
import { themeCssVariables, ThemeContext } from 'twenty-ui/theme-constants';
import {
  type MouseEvent as ReactMouseEvent,
  type PointerEvent as ReactPointerEvent,
  useContext,
  useState,
} from 'react';

const DRAG_CLICK_SUPPRESSION_DISTANCE = 5;

const StyledGripContainerBase = styled.div`
  align-items: center;
  border-radius: ${themeCssVariables.border.radius.sm};
  box-sizing: border-box;
  cursor: grab;
  display: flex;
  height: 20px;
  justify-content: center;
  user-select: none;
  width: 20px;

  &:active {
    background: ${themeCssVariables.background.tertiary};
    cursor: grabbing;
  }

  &:hover {
    background: ${themeCssVariables.background.tertiary};
  }
`;
const StyledGripContainer = motion.create(StyledGripContainerBase);

type WidgetGripProps = {
  className?: string;
};

export const WidgetGrip = ({ className }: WidgetGripProps) => {
  const { theme } = useContext(ThemeContext);
  // Only pointerdown is tracked: the compatibility mousedown that touch fires
  // afterwards reports the release point, which would hide every drag.
  const [pointerDownPosition, setPointerDownPosition] = useState<{
    x: number;
    y: number;
  } | null>(null);

  const handlePointerDown = (event: ReactPointerEvent) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    setPointerDownPosition({
      x: event.clientX,
      y: event.clientY,
    });
  };

  const handleClick = (event: ReactMouseEvent) => {
    setPointerDownPosition(null);

    if (
      isDefined(pointerDownPosition) &&
      Math.hypot(
        event.clientX - pointerDownPosition.x,
        event.clientY - pointerDownPosition.y,
      ) > DRAG_CLICK_SUPPRESSION_DISTANCE
    ) {
      event.stopPropagation();
    }
  };

  return (
    <StyledGripContainer
      layout
      className={className}
      onPointerDown={handlePointerDown}
      onClick={handleClick}
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
