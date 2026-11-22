import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { Dropdown } from 'twenty-ui/components/navigation';
import { IconPlus } from 'twenty-ui/icon';
import { Tooltip } from 'twenty-ui/primitives/surfaces';
import { themeCssVariables } from 'twenty-ui/theme';

import { NavigationMenuItemEntrance } from '@/navigation-menu-item/edit/components/NavigationMenuItemEntrance';
import { NavigationMenuItemSelectableItem } from '@/navigation-menu-item/edit/components/NavigationMenuItemSelectableItem';
import { usePinnableCommandOptions } from '@/navigation-menu-item/edit/hooks/usePinnableCommandOptions';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownRoot } from '@/ui/layout/dropdown/components/DropdownRoot';
import { GenericDropdownContentWidth } from '@/ui/layout/dropdown/constants/GenericDropdownContentWidth';
import { TooltipDelay } from '@/ui/layout/tooltip/constants/TooltipDelay';
import { NavigationDrawerItem } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerItem';

const StyledDisabledAddCommand = styled.div`
  cursor: not-allowed;

  .navigation-drawer-item,
  .navigation-drawer-item:hover {
    background: transparent;
    color: ${themeCssVariables.font.color.light};
    pointer-events: none;
  }
`;

export const NavigationMenuItemPinnedCommandAddButton = () => {
  const { t } = useLingui();
  const pinnableCommandOptions = usePinnableCommandOptions();
  const areAllCommandsPinned = pinnableCommandOptions.every(
    ({ isAlreadyInSidebar }) => isAlreadyInSidebar,
  );

  const addCommandItem = (
    <NavigationDrawerItem
      Icon={IconPlus}
      label={t`Add command`}
      triggerEvent="CLICK"
      variant="tertiary"
    />
  );

  return (
    <NavigationMenuItemEntrance>
      {areAllCommandsPinned ? (
        <Tooltip
          content={t`All commands are already in the sidebar`}
          side="right"
          delay={TooltipDelay.noDelay}
          positionMethod="fixed"
        >
          <StyledDisabledAddCommand>{addCommandItem}</StyledDisabledAddCommand>
        </Tooltip>
      ) : (
        <DropdownRoot dropdownId="navigation-add-pinned-command" type="picker">
          <Dropdown.Trigger
            nativeButton={false}
            render={<div tabIndex={-1}>{addCommandItem}</div>}
          />
          <DropdownContent
            side="right"
            align="start"
            width={GenericDropdownContentWidth.Large}
          >
            <Dropdown.Section>
              {pinnableCommandOptions.map((option) => (
                <NavigationMenuItemSelectableItem
                  key={option.id}
                  item={option}
                />
              ))}
            </Dropdown.Section>
          </DropdownContent>
        </DropdownRoot>
      )}
    </NavigationMenuItemEntrance>
  );
};
