import { useLingui } from '@lingui/react/macro';
import {
  IconChevronDown,
  IconChevronUp,
  IconFolderSymlink,
  IconRowInsertBottom,
  IconRowInsertTop,
  IconTrash,
} from 'twenty-ui/display';

import { CommandGroup } from '@/command-menu/components/CommandGroup';
import { CommandMenuItem } from '@/command-menu/components/CommandMenuItem';
import { CommandMenuNavigationItemActions } from '@/command-menu/pages/navigation-menu-item/command-menu-navigation-item-actions';
import { SelectableListItem } from '@/ui/layout/selectable-list/components/SelectableListItem';

export type OrganizeActionsProps = {
  canMoveUp: boolean;
  canMoveDown: boolean;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onRemove: () => void;
  onAddBefore?: () => void;
  onAddAfter?: () => void;
};

type CommandMenuEditOrganizeActionsProps = OrganizeActionsProps & {
  showMoveToFolder?: boolean;
  onMoveToFolder?: () => void;
  moveToFolderHasSubMenu?: boolean;
};

export const CommandMenuEditOrganizeActions = ({
  canMoveUp,
  canMoveDown,
  onMoveUp,
  onMoveDown,
  onRemove,
  onAddBefore,
  onAddAfter,
  showMoveToFolder = false,
  onMoveToFolder,
  moveToFolderHasSubMenu = false,
}: CommandMenuEditOrganizeActionsProps) => {
  const { t } = useLingui();

  return (
    <CommandGroup heading={t`Organize`}>
      <SelectableListItem
        itemId={CommandMenuNavigationItemActions.MOVE_UP}
        onEnter={canMoveUp ? onMoveUp : undefined}
      >
        <CommandMenuItem
          Icon={IconChevronUp}
          label={t`Move up`}
          id={CommandMenuNavigationItemActions.MOVE_UP}
          onClick={onMoveUp}
          disabled={!canMoveUp}
        />
      </SelectableListItem>
      <SelectableListItem
        itemId={CommandMenuNavigationItemActions.MOVE_DOWN}
        onEnter={canMoveDown ? onMoveDown : undefined}
      >
        <CommandMenuItem
          Icon={IconChevronDown}
          label={t`Move down`}
          id={CommandMenuNavigationItemActions.MOVE_DOWN}
          onClick={onMoveDown}
          disabled={!canMoveDown}
        />
      </SelectableListItem>
      {showMoveToFolder && onMoveToFolder && (
        <SelectableListItem
          itemId={CommandMenuNavigationItemActions.MOVE_TO_FOLDER}
          onEnter={onMoveToFolder}
        >
          <CommandMenuItem
            Icon={IconFolderSymlink}
            label={t`Move to folder`}
            id={CommandMenuNavigationItemActions.MOVE_TO_FOLDER}
            hasSubMenu={moveToFolderHasSubMenu}
            onClick={onMoveToFolder}
          />
        </SelectableListItem>
      )}
      {onAddBefore && (
        <SelectableListItem
          itemId={CommandMenuNavigationItemActions.ADD_BEFORE}
          onEnter={onAddBefore}
        >
          <CommandMenuItem
            Icon={IconRowInsertTop}
            label={t`Add menu item before`}
            id={CommandMenuNavigationItemActions.ADD_BEFORE}
            onClick={onAddBefore}
          />
        </SelectableListItem>
      )}
      {onAddAfter && (
        <SelectableListItem
          itemId={CommandMenuNavigationItemActions.ADD_AFTER}
          onEnter={onAddAfter}
        >
          <CommandMenuItem
            Icon={IconRowInsertBottom}
            label={t`Add menu item after`}
            id={CommandMenuNavigationItemActions.ADD_AFTER}
            onClick={onAddAfter}
          />
        </SelectableListItem>
      )}
      <SelectableListItem
        itemId={CommandMenuNavigationItemActions.REMOVE}
        onEnter={onRemove}
      >
        <CommandMenuItem
          Icon={IconTrash}
          label={t`Remove from sidebar`}
          id={CommandMenuNavigationItemActions.REMOVE}
          onClick={onRemove}
        />
      </SelectableListItem>
    </CommandGroup>
  );
};
