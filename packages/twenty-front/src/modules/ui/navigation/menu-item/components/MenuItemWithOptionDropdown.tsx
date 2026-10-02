import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownRoot } from '@/ui/layout/dropdown/components/DropdownRoot';
import { isDropdownOpenComponentState } from '@/ui/layout/dropdown/states/isDropdownOpenComponentState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { t } from '@lingui/core/macro';
import { type MouseEvent } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { Dropdown, LightIconButton } from 'twenty-ui/components';
import { IconDotsVertical } from 'twenty-ui/icon';
import { ListItem } from 'twenty-ui/primitives/navigation';
import { useTheme } from 'twenty-ui/theme';
import { type MenuItemWithOptionDropdownProps } from './types/MenuItemWithOptionDropdownProps';

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
  dropdownSide = 'bottom',
  dropdownAlign = 'end',
  selected = false,
}: MenuItemWithOptionDropdownProps) => {
  const theme = useTheme();
  const isDropdownOpen = useAtomComponentStateValue(
    isDropdownOpenComponentState,
    dropdownId,
  );
  const handleMenuItemClick = (event: MouseEvent<HTMLDivElement>) => {
    if (!isDefined(onClick)) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    onClick(event);
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
      startIcon={isDefined(LeftIcon) && <LeftIcon size={theme.icon.size.md} />}
      hasSubmenu={hasSubMenu}
      actionsVisibility={
        isIconDisplayedOnHoverOnly && !isDropdownOpen ? 'hover' : 'always'
      }
      actions={
        <div className="hoverable-buttons">
          <DropdownRoot dropdownId={dropdownId} type="menu">
            <Dropdown.Trigger
              render={
                <LightIconButton
                  size="sm"
                  emphasis="subtle"
                  aria-label={t`More options`}
                >
                  {isDefined(RightIcon) ? <RightIcon /> : <IconDotsVertical />}
                </LightIconButton>
              }
            />
            <DropdownContent side={dropdownSide} align={dropdownAlign}>
              {dropdownContent}
            </DropdownContent>
          </DropdownRoot>
        </div>
      }
    >
      {text}
    </ListItem>
  );
};
