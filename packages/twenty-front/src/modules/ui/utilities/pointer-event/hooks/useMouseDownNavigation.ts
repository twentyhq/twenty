import { useNavigate } from 'react-router-dom';
import { isDefined } from 'twenty-shared/utils';

type UseMouseDownNavigationProps = {
  to?: string;
  onClick?: () => void;
  disabled?: boolean;
  onBeforeNavigation?: () => void;
  disableMouseDownNavigation?: boolean;
};

export const useMouseDownNavigation = ({
  to,
  onClick,
  disabled = false,
  onBeforeNavigation,
  disableMouseDownNavigation = false,
}: UseMouseDownNavigationProps) => {
  const navigate = useNavigate();

  const isModifierKeyPressed = (event: React.MouseEvent) => {
    return (
      event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0
    );
  };

  const executeAction = () => {
    onBeforeNavigation?.();

    if (isDefined(onClick)) {
      onClick();
    } else if (isDefined(to)) {
      navigate(to);
    }
  };

  const handleClick = (event: React.MouseEvent) => {
    if (disabled) return;

    // For modifier keys, let the default browser behavior handle it
    if (isModifierKeyPressed(event)) {
      if (isDefined(onClick)) {
        onClick();
      }
      // Don't prevent default for modifier keys to allow browser navigation
      return;
    }

    // For regular clicks, prevent default to avoid double navigation
    if (isDefined(to) && !isDefined(onClick)) {
      event.preventDefault();
    }
  };

  const handleMouseDown = (event: React.MouseEvent) => {
    if (disabled || disableMouseDownNavigation) return;

    // Only handle left mouse button without modifier keys
    if (!isModifierKeyPressed(event)) {
      executeAction();
    }
  };

  return {
    onClick: handleClick,
    onMouseDown: handleMouseDown,
  };
};
