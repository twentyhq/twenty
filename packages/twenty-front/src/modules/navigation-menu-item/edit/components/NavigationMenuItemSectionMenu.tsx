import { useLingui } from '@lingui/react/macro';
import { LightIconButton } from 'twenty-ui/components/input';
import { Dropdown } from 'twenty-ui/components/navigation';
import { IconDotsVertical } from 'twenty-ui/icon';
import { type NavigationMenuItem } from '~/generated-metadata/graphql';

import { navigationMenuItemIdToRenameState } from '@/navigation-menu-item/common/states/navigationMenuItemIdToRenameState';
import { NavigationMenuItemSectionMenuContent } from '@/navigation-menu-item/edit/components/NavigationMenuItemSectionMenuContent';
import { NavigationMenuItemContainerMenuOpenEffect } from '@/navigation-menu-item/edit/effect-components/NavigationMenuItemContainerMenuOpenEffect';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownRoot } from '@/ui/layout/dropdown/components/DropdownRoot';
import { GenericDropdownContentWidth } from '@/ui/layout/dropdown/constants/GenericDropdownContentWidth';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';

type NavigationMenuItemSectionMenuProps = {
  section: NavigationMenuItem;
};

export const NavigationMenuItemSectionMenu = ({
  section,
}: NavigationMenuItemSectionMenuProps) => {
  const { t } = useLingui();
  const { closeDropdown } = useCloseDropdown();
  const [navigationMenuItemIdToRename, setNavigationMenuItemIdToRename] =
    useAtomState(navigationMenuItemIdToRenameState);
  const dropdownId = `navigation-menu-section-menu-${section.id}`;

  return (
    <DropdownRoot dropdownId={dropdownId} type="menu">
      {navigationMenuItemIdToRename === section.id && (
        <NavigationMenuItemContainerMenuOpenEffect
          dropdownId={dropdownId}
          onOpen={() => setNavigationMenuItemIdToRename(null)}
        />
      )}
      <Dropdown.Trigger
        render={
          <LightIconButton
            emphasis="subtle"
            size="sm"
            aria-label={t`Section actions`}
          >
            <IconDotsVertical />
          </LightIconButton>
        }
      />
      <DropdownContent
        side="right"
        align="start"
        width={GenericDropdownContentWidth.Large}
      >
        <NavigationMenuItemSectionMenuContent
          section={section}
          onClose={() => closeDropdown(dropdownId)}
        />
      </DropdownContent>
    </DropdownRoot>
  );
};
