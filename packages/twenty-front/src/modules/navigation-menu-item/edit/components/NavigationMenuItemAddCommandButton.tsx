import { useLingui } from '@lingui/react/macro';
import { NAVIGATION_MENU_ITEM_COMMAND_KEYS } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { IconPlus } from 'twenty-ui/icon';
import { type NavigationMenuItem } from '~/generated-metadata/graphql';

import { NAVIGATION_MENU_ITEM_COMMANDS } from '@/navigation-menu-item/common/constants/NavigationMenuItemCommands';
import { getNavigationMenuItemCommandKey } from '@/navigation-menu-item/common/utils/getNavigationMenuItemCommandKey';
import { useNavigationMenuItemCommandRunner } from '@/navigation-menu-item/display/command/hooks/useNavigationMenuItemCommandRunner';
import { NavigationMenuItemContainerTemplateMenu } from '@/navigation-menu-item/edit/components/NavigationMenuItemContainerTemplateMenu';
import { NavigationMenuItemEntrance } from '@/navigation-menu-item/edit/components/NavigationMenuItemEntrance';
import { useCreateNavigationMenuTabOrSection } from '@/navigation-menu-item/edit/hooks/useCreateNavigationMenuTabOrSection';
import { NavigationDrawerItem } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerItem';

type NavigationMenuItemAddCommandButtonProps = {
  commandItems: NavigationMenuItem[];
};

export const NavigationMenuItemAddCommandButton = ({
  commandItems,
}: NavigationMenuItemAddCommandButtonProps) => {
  const { t } = useLingui();
  const { isCommandAvailable } = useNavigationMenuItemCommandRunner();
  const { pinCommand } = useCreateNavigationMenuTabOrSection();
  const pinnedCommandKeys = new Set(
    commandItems.map(getNavigationMenuItemCommandKey).filter(isDefined),
  );

  return (
    <NavigationMenuItemEntrance>
      <NavigationMenuItemContainerTemplateMenu
        dropdownId="navigation-menu-add-command"
        title={t`Add command`}
        isTriggerNativeButton={false}
        trigger={
          <div tabIndex={-1}>
            <NavigationDrawerItem
              Icon={IconPlus}
              label={t`Add command`}
              triggerEvent="CLICK"
              variant="tertiary"
            />
          </div>
        }
        groups={[
          {
            id: 'commands',
            options: NAVIGATION_MENU_ITEM_COMMAND_KEYS.filter(
              isCommandAvailable,
            ).map((commandKey) => {
              const { label, Icon } = NAVIGATION_MENU_ITEM_COMMANDS[commandKey];
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
    </NavigationMenuItemEntrance>
  );
};
