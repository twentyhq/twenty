import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { NAVIGATION_MENU_ITEM_COMMAND_KEYS } from 'twenty-shared/constants';
import { isDefined } from 'twenty-shared/utils';
import { IconPlus } from 'twenty-ui/icon';
import { Tooltip } from 'twenty-ui/primitives/surfaces';
import { themeCssVariables } from 'twenty-ui/theme';
import { type NavigationMenuItem } from '~/generated-metadata/graphql';

import { NAVIGATION_MENU_ITEM_COMMANDS } from '@/navigation-menu-item/common/constants/NavigationMenuItemCommands';
import { getNavigationMenuItemCommandKey } from '@/navigation-menu-item/common/utils/getNavigationMenuItemCommandKey';
import { useNavigationMenuItemCommandRunner } from '@/navigation-menu-item/display/command/hooks/useNavigationMenuItemCommandRunner';
import { NavigationMenuItemGroupedOptionsMenu } from '@/navigation-menu-item/edit/components/NavigationMenuItemGroupedOptionsMenu';
import { NavigationMenuItemEntrance } from '@/navigation-menu-item/edit/components/NavigationMenuItemEntrance';
import { usePinNavigationMenuCommand } from '@/navigation-menu-item/edit/hooks/usePinNavigationMenuCommand';
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

type NavigationMenuItemAddCommandButtonProps = {
  commandItems: NavigationMenuItem[];
};

export const NavigationMenuItemAddCommandButton = ({
  commandItems,
}: NavigationMenuItemAddCommandButtonProps) => {
  const { t } = useLingui();
  const { isCommandAvailable } = useNavigationMenuItemCommandRunner();
  const { pinCommand } = usePinNavigationMenuCommand();
  const pinnedCommandKeys = new Set(
    commandItems.map(getNavigationMenuItemCommandKey).filter(isDefined),
  );
  const availableCommandKeys =
    NAVIGATION_MENU_ITEM_COMMAND_KEYS.filter(isCommandAvailable);
  const areAllCommandsPinned = availableCommandKeys.every((commandKey) =>
    pinnedCommandKeys.has(commandKey),
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
        <NavigationMenuItemGroupedOptionsMenu
          dropdownId="navigation-menu-add-command"
          title={t`Add command`}
          isTriggerNativeButton={false}
          trigger={<div tabIndex={-1}>{addCommandItem}</div>}
          groups={[
            {
              id: 'commands',
              options: availableCommandKeys.map((commandKey) => {
                const { label, Icon } =
                  NAVIGATION_MENU_ITEM_COMMANDS[commandKey];
                const isAlreadyInSidebar = pinnedCommandKeys.has(commandKey);

                return {
                  id: commandKey,
                  label: t(label),
                  Icon,
                  isDisabled: isAlreadyInSidebar,
                  isAlreadyInSidebar,
                  onClick: () => pinCommand(commandKey),
                };
              }),
            },
          ]}
        />
      )}
    </NavigationMenuItemEntrance>
  );
};
