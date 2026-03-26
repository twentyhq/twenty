import { type IconComponent } from 'twenty-ui/display';
import {
  MenuItemDraggable,
  type MenuItemDraggableGripMode,
  type MenuItemIconButton,
} from 'twenty-ui/navigation';

import { useCommandMenuOnItemClick } from '@/command-menu/hooks/useCommandMenuOnItemClick';

export type CommandMenuItemDraggableProps = {
  label: string;
  description?: string;
  to?: string;
  onClick?: () => void;
  Icon?: IconComponent;
  iconButtons?: MenuItemIconButton[];
  disabled?: boolean;
  gripMode?: MenuItemDraggableGripMode;
  isDragDisabled?: boolean;
  isIconDisplayedOnHoverOnly?: boolean;
};

export const CommandMenuItemDraggable = ({
  label,
  description,
  to,
  onClick,
  Icon,
  iconButtons,
  disabled = false,
  gripMode = 'never',
  isDragDisabled = false,
  isIconDisplayedOnHoverOnly = true,
}: CommandMenuItemDraggableProps) => {
  const { onItemClick } = useCommandMenuOnItemClick();

  return (
    <MenuItemDraggable
      withIconContainer
      LeftIcon={Icon}
      text={label}
      contextualText={description}
      iconButtons={iconButtons}
      isDragDisabled={disabled || isDragDisabled}
      gripMode={gripMode}
      isIconDisplayedOnHoverOnly={isIconDisplayedOnHoverOnly}
      onClick={
        disabled
          ? undefined
          : onClick || to
            ? () =>
                onItemClick({
                  onClick,
                  to,
                })
            : undefined
      }
    />
  );
};
