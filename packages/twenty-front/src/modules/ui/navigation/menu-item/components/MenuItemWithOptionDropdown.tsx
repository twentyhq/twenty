import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { type MouseEvent, useContext } from 'react';
import { LightIconButton } from 'twenty-ui/components';
import { IconDotsVertical } from 'twenty-ui/icon';
import { ListItem } from 'twenty-ui/primitives/navigation';
import { ThemeContext } from 'twenty-ui/theme-constants';
import { type MenuItemWithOptionDropdownProps } from './types/MenuItemWithOptionDropdownProps';

// TODO: refactor this
export const MenuItemWithOptionDropdown = ({
  accent = 'default',
  className,
  isIconDisplayedOnHoverOnly = true,
  dropdownContent,
  dropdownId,
  LeftIcon,
  RightIcon,
  onClick,
  onMouseEnter,
  onMouseLeave,
  testId,
  text,
  hasSubMenu = false,
  dropdownPlacement = 'bottom-end',
  selected = false,
}: MenuItemWithOptionDropdownProps) => {
  const { theme } = useContext(ThemeContext);
  const handleMenuItemClick = (event: MouseEvent<HTMLDivElement>) => {
    if (!onClick) return;
    event.preventDefault();
    event.stopPropagation();

    onClick?.(event);
  };

  return (
    <ListItem
      data-testid={testId ?? undefined}
      onClick={handleMenuItemClick}
      className={className}
      color={accent === 'danger' ? 'danger' : 'neutral'}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      focused={selected}
      startIcon={LeftIcon && <LeftIcon size={theme.icon.size.md} />}
      hasSubmenu={hasSubMenu}
      actionsVisibility={isIconDisplayedOnHoverOnly ? 'hover' : 'always'}
      actions={
        <div className="hoverable-buttons">
          <Dropdown
            clickableComponent={
              <LightIconButton
                Icon={RightIcon ?? IconDotsVertical}
                size="small"
                accent="tertiary"
              />
            }
            dropdownPlacement={dropdownPlacement}
            dropdownComponents={dropdownContent}
            dropdownId={dropdownId}
          />
        </div>
      }
    >
      {text}
    </ListItem>
  );
};
