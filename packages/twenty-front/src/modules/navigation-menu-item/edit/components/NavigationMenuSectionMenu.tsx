import { useLingui } from '@lingui/react/macro';
import { LightIconButton } from 'twenty-ui/components/input';
import { Dropdown } from 'twenty-ui/components/navigation';
import { IconDotsVertical } from 'twenty-ui/icon';

import { navigationMenuItemIdToRenameState } from '@/navigation-menu-item/common/states/navigationMenuItemIdToRenameState';
import { NavigationMenuSectionMenuContent } from '@/navigation-menu-item/edit/components/NavigationMenuSectionMenuContent';
import { NavigationMenuItemDropdownOpenEffect } from '@/navigation-menu-item/edit/effect-components/NavigationMenuItemDropdownOpenEffect';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownRoot } from '@/ui/layout/dropdown/components/DropdownRoot';
import { GenericDropdownContentWidth } from '@/ui/layout/dropdown/constants/GenericDropdownContentWidth';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';
import { type NavigationMenuItem } from '~/generated-metadata/graphql';

type NavigationMenuSectionMenuProps = {
  section: Pick<
    NavigationMenuItem,
    'id' | 'name' | 'icon' | 'parentId' | 'type' | 'builtInSectionKey'
  >;
};

export const NavigationMenuSectionMenu = ({
  section,
}: NavigationMenuSectionMenuProps) => {
  const { t } = useLingui();
  const { closeDropdown } = useCloseDropdown();
  const [navigationMenuItemIdToRename, setNavigationMenuItemIdToRename] =
    useAtomState(navigationMenuItemIdToRenameState);
  const dropdownId = `navigation-menu-section-menu-${section.id}`;

  return (
    <DropdownRoot dropdownId={dropdownId} type="menu">
      {navigationMenuItemIdToRename === section.id && (
        <NavigationMenuItemDropdownOpenEffect
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
        <NavigationMenuSectionMenuContent
          section={section}
          onClose={() => closeDropdown(dropdownId)}
        />
      </DropdownContent>
    </DropdownRoot>
  );
};
