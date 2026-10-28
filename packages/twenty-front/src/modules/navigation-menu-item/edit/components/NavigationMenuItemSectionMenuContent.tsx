import { plural } from '@lingui/core/macro';
import { useLingui } from '@lingui/react/macro';
import { NavigationMenuItemType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { Dropdown, useDropdownPage } from 'twenty-ui/components/navigation';
import {
  IconEye,
  IconFolderSymlink,
  IconHome,
  IconTrash,
  useIcons,
} from 'twenty-ui/icon';
import { type NavigationMenuItem } from '~/generated-metadata/graphql';

import { NAVIGATION_MENU_SECTION_VISIBLE_ITEM_LIMIT_OPTIONS } from '@/navigation-menu-item/common/constants/NavigationMenuSectionVisibleItemLimitOptions';
import { NAVIGATION_MENU_TAB_ICON_DEFAULT } from '@/navigation-menu-item/common/constants/NavigationMenuTabIconDefault';
import { useWorkspaceNavigationMenuTabs } from '@/navigation-menu-item/display/hooks/useWorkspaceNavigationMenuTabs';
import { NavigationMenuItemContainerNameEditor } from '@/navigation-menu-item/edit/components/NavigationMenuItemContainerNameEditor';
import { NavigationMenuItemSelectableItem } from '@/navigation-menu-item/edit/components/NavigationMenuItemSelectableItem';
import { useNavigationMenuItemEditController } from '@/navigation-menu-item/edit/hooks/useNavigationMenuItemEditController';
import { useNavigationMenuItemMoveRemove } from '@/navigation-menu-item/edit/hooks/useNavigationMenuItemMoveRemove';
import { useNavigationMenuItemReorderOptions } from '@/navigation-menu-item/edit/hooks/useNavigationMenuItemReorderOptions';
import { type NavigationMenuItemOption } from '@/navigation-menu-item/edit/types/NavigationMenuItemOption';

type NavigationMenuItemSectionMenuContentProps = {
  section: NavigationMenuItem;
  defaultName?: string;
  onClose: () => void;
};

export const NavigationMenuItemSectionMenuContent = ({
  section,
  defaultName,
  onClose,
}: NavigationMenuItemSectionMenuContentProps) => {
  const { t } = useLingui();
  const { getIcon } = useIcons();
  const { goToPage } = useDropdownPage();
  const tabs = useWorkspaceNavigationMenuTabs();
  const { moveToContainer, remove } =
    useNavigationMenuItemMoveRemove('workspace');
  const { reorderOptions } = useNavigationMenuItemReorderOptions({
    navigationMenuItemId: section.id,
    section: 'workspace',
    onClose,
  });
  const { updateItem } = useNavigationMenuItemEditController('workspace');
  const parentId = section.folderId ?? null;

  const isVisibleItemLimitEditable =
    section.type !== NavigationMenuItemType.FAVORITES;
  const visibleItemLimit = section.visibleItemLimit ?? null;

  const run = (action: () => Promise<void>) => {
    void action();
    onClose();
  };

  const getVisibleItemLimitLabel = (limit: number | null) =>
    isDefined(limit)
      ? plural(limit, { one: '# item', other: '# items' })
      : t`All items`;

  const actions: NavigationMenuItemOption[] = [
    ...reorderOptions,
    {
      id: 'move',
      label: t`Move to tab`,
      Icon: IconFolderSymlink,
      isDisabled: tabs.length === 0,
      hasSubMenu: true,
      onClick: () => goToPage('move'),
    },
    {
      id: 'remove',
      label: t`Remove section`,
      Icon: IconTrash,
      accent: 'danger',
      onClick: () => run(() => remove(section.id)),
    },
  ];

  const destinations: NavigationMenuItemOption[] = [
    {
      id: 'home',
      label: t`Home`,
      Icon: IconHome,
      isDisabled: !isDefined(parentId),
      onClick: () => run(() => moveToContainer(section.id, null)),
    },
    ...tabs.map((tab) => ({
      id: tab.id,
      label: tab.name ?? t`Tab`,
      Icon: getIcon(tab.icon ?? NAVIGATION_MENU_TAB_ICON_DEFAULT),
      isDisabled: parentId === tab.id,
      onClick: () => run(() => moveToContainer(section.id, tab.id)),
    })),
  ];

  return (
    <>
      <Dropdown.Page id="root">
        <NavigationMenuItemContainerNameEditor
          item={section}
          placeholder={defaultName ?? t`Section name`}
          defaultName={defaultName}
          onSubmit={onClose}
        />
        <Dropdown.Separator />
        {isVisibleItemLimitEditable && (
          <>
            <Dropdown.Section>
              <NavigationMenuItemSelectableItem
                item={{
                  id: 'visible-item-limit',
                  label: t`Show`,
                  Icon: IconEye,
                  contextualText: getVisibleItemLimitLabel(visibleItemLimit),
                  hasSubMenu: true,
                  onClick: () => goToPage('visible-item-limit'),
                }}
              />
            </Dropdown.Section>
            <Dropdown.Separator />
          </>
        )}
        <Dropdown.Section>
          {actions.map((option) => (
            <NavigationMenuItemSelectableItem key={option.id} item={option} />
          ))}
        </Dropdown.Section>
      </Dropdown.Page>
      {isVisibleItemLimitEditable && (
        <Dropdown.Page id="visible-item-limit">
          <Dropdown.Back>{t`Show`}</Dropdown.Back>
          <Dropdown.Section scrollable>
            {[...NAVIGATION_MENU_SECTION_VISIBLE_ITEM_LIMIT_OPTIONS, null].map(
              (visibleItemLimitOption) => (
                <Dropdown.OptionItem
                  key={visibleItemLimitOption ?? 'all'}
                  selected={visibleItemLimitOption === visibleItemLimit}
                  indicator="check"
                  onSelect={() =>
                    run(() =>
                      updateItem(section.id, {
                        visibleItemLimit: visibleItemLimitOption,
                      }),
                    )
                  }
                >
                  {getVisibleItemLimitLabel(visibleItemLimitOption)}
                </Dropdown.OptionItem>
              ),
            )}
          </Dropdown.Section>
        </Dropdown.Page>
      )}
      <Dropdown.Page id="move">
        <Dropdown.Back>{t`Move to tab`}</Dropdown.Back>
        <Dropdown.Section scrollable>
          {destinations.map((option) => (
            <NavigationMenuItemSelectableItem key={option.id} item={option} />
          ))}
        </Dropdown.Section>
      </Dropdown.Page>
    </>
  );
};
