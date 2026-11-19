import { useLingui } from '@lingui/react/macro';
import { LightIconButton } from 'twenty-ui/components/input';
import { Dropdown } from 'twenty-ui/components/navigation';
import { NavigationMenuItemType } from 'twenty-shared/types';
import { IconDotsVertical, IconTrash } from 'twenty-ui/icon';

import { navigationMenuItemIdToRenameState } from '@/navigation-menu-item/common/states/navigationMenuItemIdToRenameState';
import { isNavigationMenuItemBuiltInSection } from '@/navigation-menu-item/common/utils/isNavigationMenuItemBuiltInSection';
import { NavigationMenuItemContainerNameEditor } from '@/navigation-menu-item/edit/components/NavigationMenuItemContainerNameEditor';
import { NavigationMenuItemSelectableItem } from '@/navigation-menu-item/edit/components/NavigationMenuItemSelectableItem';
import { NavigationMenuItemDropdownOpenEffect } from '@/navigation-menu-item/edit/effect-components/NavigationMenuItemDropdownOpenEffect';
import { useNavigationMenuContainerReorderOptions } from '@/navigation-menu-item/edit/hooks/useNavigationMenuContainerReorderOptions';
import { useNavigationMenuItemMoveRemove } from '@/navigation-menu-item/edit/hooks/useNavigationMenuItemMoveRemove';
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
  const { remove } = useNavigationMenuItemMoveRemove('workspace');
  const dropdownId = `navigation-menu-section-menu-${section.id}`;
  const reorderOptions = useNavigationMenuContainerReorderOptions({
    itemId: section.id,
    type: NavigationMenuItemType.SECTION,
    containerId: section.parentId ?? null,
    onMoved: () => closeDropdown(dropdownId),
  });

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
        {!isNavigationMenuItemBuiltInSection(section) && (
          <>
            <NavigationMenuItemContainerNameEditor
              item={section}
              placeholder={t`Section name`}
              onSubmit={() => closeDropdown(dropdownId)}
            />
            <Dropdown.Separator />
          </>
        )}
        <Dropdown.Section>
          {reorderOptions.map((option) => (
            <NavigationMenuItemSelectableItem key={option.id} item={option} />
          ))}
          <NavigationMenuItemSelectableItem
            item={{
              id: 'remove',
              label: t`Remove section`,
              Icon: IconTrash,
              accent: 'danger',
              onClick: () => {
                void remove(section.id);
                closeDropdown(dropdownId);
              },
            }}
          />
        </Dropdown.Section>
      </DropdownContent>
    </DropdownRoot>
  );
};
