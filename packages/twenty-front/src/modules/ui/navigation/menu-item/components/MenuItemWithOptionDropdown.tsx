import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { t } from '@lingui/core/macro';
import { type MouseEvent } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { LightIconButton } from 'twenty-ui/components';
import { IconDotsVertical } from 'twenty-ui/icon';
import { ListItem } from 'twenty-ui/primitives/navigation';
import { useTheme } from 'twenty-ui/theme';
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
  const theme = useTheme();
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
                size="sm"
                emphasis="subtle"
                aria-label={t`More options`}
              >
                {isDefined(RightIcon) ? <RightIcon /> : <IconDotsVertical />}
              </LightIconButton>
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
