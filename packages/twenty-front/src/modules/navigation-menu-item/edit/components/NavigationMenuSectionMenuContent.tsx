import { useLingui } from '@lingui/react/macro';
import { NavigationMenuItemType } from 'twenty-shared/types';
import { Dropdown, useDropdownPage } from 'twenty-ui/components/navigation';
import { IconFolderSymlink, IconHome, IconTrash } from 'twenty-ui/icon';
import { useIcons } from 'twenty-ui/icon/provider';
import { isDefined } from 'twenty-shared/utils';

import { NAVIGATION_MENU_TAB_ICON_DEFAULT } from '@/navigation-menu-item/common/constants/NavigationMenuTabIconDefault';
import { canAddBuiltInSectionToContainer } from '@/navigation-menu-item/common/utils/canAddBuiltInSectionToContainer';
import { isNavigationMenuItemBuiltInSection } from '@/navigation-menu-item/common/utils/isNavigationMenuItemBuiltInSection';
import { useNavigationMenuItemsData } from '@/navigation-menu-item/display/hooks/useNavigationMenuItemsData';
import { useWorkspaceNavigationMenuContainers } from '@/navigation-menu-item/display/hooks/useWorkspaceNavigationMenuContainers';
import { NavigationMenuItemContainerNameEditor } from '@/navigation-menu-item/edit/components/NavigationMenuItemContainerNameEditor';
import { NavigationMenuItemSelectableItem } from '@/navigation-menu-item/edit/components/NavigationMenuItemSelectableItem';
import { useNavigationMenuContainerReorderOptions } from '@/navigation-menu-item/edit/hooks/useNavigationMenuContainerReorderOptions';
import { useNavigationMenuItemMoveRemove } from '@/navigation-menu-item/edit/hooks/useNavigationMenuItemMoveRemove';
import { type NavigationMenuItemOption } from '@/navigation-menu-item/edit/types/NavigationMenuItemOption';
import { type NavigationMenuItem } from '~/generated-metadata/graphql';

type NavigationMenuSectionMenuContentProps = {
  section: Pick<
    NavigationMenuItem,
    'id' | 'name' | 'icon' | 'parentId' | 'type' | 'builtInSectionKey'
  >;
  onClose: () => void;
};

export const NavigationMenuSectionMenuContent = ({
  section,
  onClose,
}: NavigationMenuSectionMenuContentProps) => {
  const { t } = useLingui();
  const { getIcon } = useIcons();
  const { goToPage } = useDropdownPage();
  const { workspaceNavigationMenuItems } = useNavigationMenuItemsData();
  const { remove, moveToFolder } = useNavigationMenuItemMoveRemove('workspace');
  const tabs = useWorkspaceNavigationMenuContainers({
    type: NavigationMenuItemType.TAB,
    containerId: null,
  });
  const currentContainerId = section.parentId ?? null;
  const reorderOptions = useNavigationMenuContainerReorderOptions({
    itemId: section.id,
    type: NavigationMenuItemType.SECTION,
    containerId: currentContainerId,
    onMoved: onClose,
  });

  const isBuiltInSection = isNavigationMenuItemBuiltInSection(section);

  const canMoveTo = (containerId: string | null) =>
    containerId !== currentContainerId &&
    (!isDefined(section.builtInSectionKey) ||
      canAddBuiltInSectionToContainer({
        builtInSectionKey: section.builtInSectionKey,
        containerId,
        items: workspaceNavigationMenuItems,
      }));

  const moveTo = (containerId: string | null) => {
    void moveToFolder(section.id, containerId);
    onClose();
  };

  const tabOptions: NavigationMenuItemOption[] = [
    {
      id: 'home',
      label: t`Home`,
      Icon: IconHome,
      isDisabled: !canMoveTo(null),
      onClick: () => moveTo(null),
    },
    ...tabs.map((tab) => ({
      id: tab.id,
      label: tab.name,
      Icon: getIcon(tab.icon ?? NAVIGATION_MENU_TAB_ICON_DEFAULT),
      isDisabled: !canMoveTo(tab.id),
      onClick: () => moveTo(tab.id),
    })),
  ];

  return (
    <>
      <Dropdown.Page id="root">
        {!isBuiltInSection && (
          <>
            <NavigationMenuItemContainerNameEditor
              item={section}
              placeholder={t`Section name`}
              onSubmit={onClose}
            />
            <Dropdown.Separator />
          </>
        )}
        <Dropdown.Section>
          {reorderOptions.map((option) => (
            <NavigationMenuItemSelectableItem key={option.id} item={option} />
          ))}
          {tabs.length > 0 && (
            <NavigationMenuItemSelectableItem
              item={{
                id: 'move-to-tab',
                label: t`Move to tab`,
                Icon: IconFolderSymlink,
                hasSubMenu: true,
                onClick: () => goToPage('tabs'),
              }}
            />
          )}
          <NavigationMenuItemSelectableItem
            item={{
              id: 'remove',
              label: t`Remove section`,
              Icon: IconTrash,
              accent: 'danger',
              onClick: () => {
                void remove(section.id);
                onClose();
              },
            }}
          />
        </Dropdown.Section>
      </Dropdown.Page>
      <Dropdown.Page id="tabs">
        <Dropdown.Back>{t`Move to tab`}</Dropdown.Back>
        <Dropdown.Section scrollable>
          {tabOptions.map((option) => (
            <NavigationMenuItemSelectableItem key={option.id} item={option} />
          ))}
        </Dropdown.Section>
      </Dropdown.Page>
    </>
  );
};
