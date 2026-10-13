import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownRoot } from '@/ui/layout/dropdown/components/DropdownRoot';
import { isDropdownOpenComponentState } from '@/ui/layout/dropdown/states/isDropdownOpenComponentState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { type MouseEvent } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { LightIconButton } from 'twenty-ui/components/input';
import { Dropdown } from 'twenty-ui/components/navigation';
import { IconDotsVertical } from 'twenty-ui/icon';
import { ListItem } from 'twenty-ui/primitives/navigation';
import { themeCssVariables, useTheme } from 'twenty-ui/theme';
import { type MenuItemWithOptionDropdownProps } from './types/MenuItemWithOptionDropdownProps';

const StyledMenuItemContainer = styled.div<{
  focused: boolean;
  showActions: boolean;
}>`
  align-items: center;
  background: ${({ focused }) =>
    focused ? themeCssVariables.background.transparent.light : 'transparent'};
  border-radius: calc(
    ${themeCssVariables.border.radius.md} - ${themeCssVariables.spacing[1]}
  );
  box-sizing: border-box;
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  min-width: 0;
  padding-inline: ${themeCssVariables.spacing[1]};
  width: 100%;

  &:hover {
    background: ${themeCssVariables.background.transparent.light};
  }

  .hoverable-buttons {
    display: flex;
  }

  @media (hover: hover) and (pointer: fine) {
    .hoverable-buttons {
      opacity: ${({ showActions }) => (showActions ? 1 : 0)};
    }

    &:hover .hoverable-buttons,
    &:focus-within .hoverable-buttons {
      opacity: 1;
    }
  }
`;

const StyledPrimaryListItem = styled(ListItem)`
  background: transparent;
  flex: 1;
  min-width: 0;
  padding-inline: 0;
`;

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
  const handleMenuItemClick = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    onClick?.(event);
  };

  return (
    <StyledMenuItemContainer
      data-testid={testId ?? undefined}
      className={className}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      focused={selected}
      showActions={!isIconDisplayedOnHoverOnly || isDropdownOpen}
    >
      <StyledPrimaryListItem
        render={
          isDefined(onClick) ? (
            <button type="button" onClick={handleMenuItemClick} />
          ) : undefined
        }
        color={accent === 'danger' ? 'danger' : 'neutral'}
        focused={selected}
        startIcon={
          isDefined(LeftIcon) && <LeftIcon size={theme.icon.size.md} />
        }
        hasSubmenu={hasSubMenu}
      >
        {text}
      </StyledPrimaryListItem>
      <div className="hoverable-buttons">
        <DropdownRoot dropdownId={dropdownId} type="menu">
          <Dropdown.Trigger
            onClick={(event) => event.stopPropagation()}
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
          <DropdownContent
            side={dropdownSide}
            align={dropdownAlign}
            onClick={(event) => event.stopPropagation()}
          >
            {dropdownContent}
          </DropdownContent>
        </DropdownRoot>
      </div>
    </StyledMenuItemContainer>
  );
};
