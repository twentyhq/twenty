import { useLingui } from '@lingui/react/macro';
import { LightIconButton } from 'twenty-ui/components/input';
import { Dropdown } from 'twenty-ui/components/navigation';
import { NavigationMenuItemType } from 'twenty-shared/types';
import { IconDotsVertical } from 'twenty-ui/icon';
import { type NavigationMenuItem } from '~/generated-metadata/graphql';

import { navigationMenuItemIdToRenameState } from '@/navigation-menu-item/common/states/navigationMenuItemIdToRenameState';
import { navigationMenuSectionIdAddingItemState } from '@/navigation-menu-item/common/states/navigationMenuSectionIdAddingItemState';
import { getNavigationMenuSectionNavigationSectionId } from '@/navigation-menu-item/display/utils/getNavigationMenuSectionNavigationSectionId';
import { NavigationMenuItemAddDropdownContent } from '@/navigation-menu-item/edit/components/NavigationMenuItemAddDropdownContent';
import { NavigationMenuItemSectionMenuContent } from '@/navigation-menu-item/edit/components/NavigationMenuItemSectionMenuContent';
import { NavigationMenuItemDropdownOpenEffect } from '@/navigation-menu-item/edit/effect-components/NavigationMenuItemDropdownOpenEffect';
import { getNavigationMenuSectionMenuDropdownId } from '@/navigation-menu-item/edit/utils/getNavigationMenuSectionMenuDropdownId';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownRoot } from '@/ui/layout/dropdown/components/DropdownRoot';
import { GenericDropdownContentWidth } from '@/ui/layout/dropdown/constants/GenericDropdownContentWidth';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { useNavigationSection } from '@/ui/navigation/navigation-drawer/hooks/useNavigationSection';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';

type NavigationMenuItemSectionMenuProps = {
  section: NavigationMenuItem;
  defaultName?: string;
};

export const NavigationMenuItemSectionMenu = ({
  section,
  defaultName,
}: NavigationMenuItemSectionMenuProps) => {
  const { t } = useLingui();
  const { closeDropdown } = useCloseDropdown();
  const [navigationMenuItemIdToRename, setNavigationMenuItemIdToRename] =
    useAtomState(navigationMenuItemIdToRenameState);
  const [
    navigationMenuSectionIdAddingItem,
    setNavigationMenuSectionIdAddingItem,
  ] = useAtomState(navigationMenuSectionIdAddingItemState);
  const { openNavigationSection } = useNavigationSection(
    getNavigationMenuSectionNavigationSectionId(section),
  );
  const dropdownId = getNavigationMenuSectionMenuDropdownId(section.id);
  const isAddingItem = navigationMenuSectionIdAddingItem === section.id;

  const startAddingItem = () => {
    openNavigationSection();
    setNavigationMenuSectionIdAddingItem(section.id);
  };

  return (
    <DropdownRoot
      dropdownId={dropdownId}
      type={isAddingItem ? 'picker' : 'menu'}
      onOpenChange={(open) => {
        if (!open) {
          setNavigationMenuSectionIdAddingItem((currentSectionId) =>
            currentSectionId === section.id ? null : currentSectionId,
          );
        }
      }}
    >
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
        width={
          isAddingItem
            ? GenericDropdownContentWidth.ExtraLarge
            : GenericDropdownContentWidth.Large
        }
      >
        {isAddingItem ? (
          <NavigationMenuItemAddDropdownContent
            dropdownId={dropdownId}
            section="workspace"
            folderId={section.id}
            onClose={() => closeDropdown(dropdownId)}
          />
        ) : (
          <NavigationMenuItemSectionMenuContent
            section={section}
            defaultName={defaultName}
            onAddItem={
              section.type === NavigationMenuItemType.SECTION
                ? startAddingItem
                : undefined
            }
            onClose={() => closeDropdown(dropdownId)}
          />
        )}
      </DropdownContent>
    </DropdownRoot>
  );
};
