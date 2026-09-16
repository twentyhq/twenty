import { useState } from 'react';
import { useLingui } from '@lingui/react/macro';
import { NavigationMenuItemType } from 'twenty-shared/types';
import {
  IconChevronUp,
  IconChevronDown,
  IconFolder,
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
import { useNavigationMenuItemEditSectionItems } from '@/navigation-menu-item/edit/hooks/useNavigationMenuItemEditSectionItems';
import { NavigationMenuItemAddDropdownContent } from '@/navigation-menu-item/edit/components/NavigationMenuItemAddDropdownContent';
import {
  NavigationMenuItemSelectableItem,
  type NavigationMenuItemOption,
} from '@/navigation-menu-item/edit/components/NavigationMenuItemSelectableItem';

type NavigationMenuItemActionsProps = {
  item: NavigationMenuItem;
  dropdownId: string;
  onClose: () => void;
};
export const NavigationMenuItemActions = ({
  item,
  dropdownId,
  onClose,
}: NavigationMenuItemActionsProps) => {
  const { t } = useLingui();
  const items = useNavigationMenuItemEditSectionItems();
  const { moveUp, moveDown, moveToFolder, remove } =
    useNavigationMenuItemMoveRemove();
  const [page, setPage] = useState<'actions' | 'folders' | 'before' | 'after'>(
    'actions',
  );
  const siblings = items
    .filter((sibling) => (sibling.folderId ?? null) === (item.folderId ?? null))
    .sort((a, b) => a.position - b.position);
  const index = siblings.findIndex((sibling) => sibling.id === item.id);
  if (page === 'before' || page === 'after')
    return (
      <NavigationMenuItemAddDropdownContent
        dropdownId={dropdownId}
        folderId={item.folderId ?? undefined}
        position={index + (page === 'after' ? 1 : 0)}
        onClose={onClose}
      />
    );
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
      onClick: () => setPage('before'),
    },
    {
      id: 'after',
      label: t`Add menu item after`,
      Icon: IconRowInsertBottom,
      hasSubMenu: true,
      onClick: () => setPage('after'),
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
      id: 'workspace',
      label: t`Workspace`,
      Icon: IconFolder,
      isDisabled: !item.folderId,
      onClick: () => run(() => moveToFolder(item.id, null)),
    },
    ...items
      .filter((folder) => folder.type === NavigationMenuItemType.FOLDER)
      .map((folder) => ({
        id: folder.id,
        label: folder.name ?? t`Folder`,
        icon: <ColoredIcon Icon={IconFolder} color={folder.color} />,
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
