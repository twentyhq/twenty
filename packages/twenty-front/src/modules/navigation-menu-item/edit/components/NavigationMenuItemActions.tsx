import { useState } from 'react';
import { FOLDER_ICON_DEFAULT } from '@/navigation-menu-item/common/constants/FolderIconDefault';
import { DEFAULT_NAVIGATION_MENU_ITEM_COLOR_FOLDER } from '@/navigation-menu-item/common/constants/NavigationMenuItemDefaultColorFolder';
import { useLingui } from '@lingui/react/macro';
import { NavigationMenuItemType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import {
  IconChevronUp,
  IconChevronDown,
  IconHierarchy2,
  useIcons,
  IconFolderSymlink,
  IconRowInsertTop,
  IconRowInsertBottom,
  IconTrash,
  IconChevronLeft,
} from 'twenty-ui/icon';
import { ColoredIcon } from '@/ui/icon/components/ColoredIcon';
import { type NavigationMenuItem } from '~/generated-metadata/graphql';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownMenuHeader } from '@/ui/layout/dropdown/components/DropdownMenuHeader/DropdownMenuHeader';
import { DropdownMenuHeaderLeftComponent } from '@/ui/layout/dropdown/components/DropdownMenuHeader/internal/DropdownMenuHeaderLeftComponent';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { GenericDropdownContentWidth } from '@/ui/layout/dropdown/constants/GenericDropdownContentWidth';
import { SelectableList } from '@/ui/layout/selectable-list/components/SelectableList';
import { useNavigationMenuItemMoveRemove } from '@/navigation-menu-item/edit/hooks/useNavigationMenuItemMoveRemove';
import { type NavigationMenuItemSection } from '@/navigation-menu-item/common/types/NavigationMenuItemSection';
import { type NavigationMenuItemAddTarget } from '@/navigation-menu-item/edit/components/NavigationMenuItemMenu';
import {
  NavigationMenuItemSelectableItem,
  type NavigationMenuItemOption,
} from '@/navigation-menu-item/edit/components/NavigationMenuItemSelectableItem';

type NavigationMenuItemActionsProps = {
  item: NavigationMenuItem;
  section: NavigationMenuItemSection;
  onAdd: (target: NavigationMenuItemAddTarget) => void;
  dropdownId: string;
  onClose: () => void;
};
export const NavigationMenuItemActions = ({
  item,
  section,
  onAdd,
  dropdownId,
  onClose,
}: NavigationMenuItemActionsProps) => {
  const { t } = useLingui();
  const { getIcon } = useIcons();
  const { items, getSortedSiblings, moveUp, moveDown, moveToFolder, remove } =
    useNavigationMenuItemMoveRemove(section);
  const [page, setPage] = useState<'actions' | 'folders'>('actions');
  const siblings = getSortedSiblings(item.id) ?? [];
  const index = siblings.findIndex((sibling) => sibling.id === item.id);
  const run = (action: () => Promise<void>) => {
    void action();
    onClose();
  };
  const actions: NavigationMenuItemOption[] = [
    {
      id: 'up',
      label: t`Move up`,
      Icon: IconChevronUp,
      isDisabled: index <= 0,
      onClick: () => run(() => moveUp(item.id)),
    },
    {
      id: 'down',
      label: t`Move down`,
      Icon: IconChevronDown,
      isDisabled: index < 0 || index === siblings.length - 1,
      onClick: () => run(() => moveDown(item.id)),
    },
    {
      id: 'folder',
      label: t`Move to folder`,
      Icon: IconFolderSymlink,
      isDisabled: item.type === NavigationMenuItemType.FOLDER,
      hasSubMenu: true,
      onClick: () => setPage('folders'),
    },
    {
      id: 'before',
      label: t`Add menu item before`,
      Icon: IconRowInsertTop,
      hasSubMenu: true,
      onClick: () =>
        onAdd({ folderId: item.folderId ?? undefined, position: index }),
    },
    {
      id: 'after',
      label: t`Add menu item after`,
      Icon: IconRowInsertBottom,
      hasSubMenu: true,
      onClick: () =>
        onAdd({ folderId: item.folderId ?? undefined, position: index + 1 }),
    },
    {
      id: 'remove',
      label: t`Remove from sidebar`,
      Icon: IconTrash,
      accent: 'danger',
      onClick: () => run(() => remove(item.id)),
    },
  ];
  const folders: NavigationMenuItemOption[] = [
    {
      id: 'root',
      label: t`Root level`,
      Icon: IconHierarchy2,
      isDisabled: !isDefined(item.folderId),
      onClick: () => run(() => moveToFolder(item.id, null)),
    },
    ...items
      .filter((folder) => folder.type === NavigationMenuItemType.FOLDER)
      .map((folder) => ({
        id: folder.id,
        label: folder.name ?? t`Folder`,
        icon: (
          <ColoredIcon
            Icon={getIcon(folder.icon ?? FOLDER_ICON_DEFAULT)}
            color={folder.color ?? DEFAULT_NAVIGATION_MENU_ITEM_COLOR_FOLDER}
          />
        ),
        isDisabled: folder.id === item.folderId,
        onClick: () => run(() => moveToFolder(item.id, folder.id)),
      })),
  ];
  const options = page === 'folders' ? folders : actions;
  return (
    <DropdownContent widthInPixels={GenericDropdownContentWidth.Large}>
      {page === 'folders' && (
        <DropdownMenuHeader
          StartComponent={
            <DropdownMenuHeaderLeftComponent
              Icon={IconChevronLeft}
              onClick={() => setPage('actions')}
            />
          }
        >{t`Move to folder`}</DropdownMenuHeader>
      )}
      <SelectableList
        key={page}
        selectableListInstanceId={`${dropdownId}-actions`}
        focusId={dropdownId}
        selectableItemIdArray={options
          .filter((option) => !option.isDisabled)
          .map((option) => option.id)}
      >
        <DropdownMenuItemsContainer hasMaxHeight={page === 'folders'}>
          {options.map((option) => (
            <NavigationMenuItemSelectableItem key={option.id} item={option} />
          ))}
        </DropdownMenuItemsContainer>
      </SelectableList>
    </DropdownContent>
  );
};
