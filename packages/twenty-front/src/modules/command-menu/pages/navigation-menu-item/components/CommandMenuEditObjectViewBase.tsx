import { CommandGroup } from '@/command-menu/components/CommandGroup';
import { CommandMenuList } from '@/command-menu/components/CommandMenuList';
import { CommandMenuEditColorOption } from '@/command-menu/pages/navigation-menu-item/components/CommandMenuEditColorOption';
import {
  type OrganizeActionsProps,
  CommandMenuEditOrganizeActions,
} from '@/command-menu/pages/navigation-menu-item/components/CommandMenuEditOrganizeActions';
import { getOrganizeActionsSelectableItemIds } from '@/command-menu/pages/navigation-menu-item/utils/getOrganizeActionsSelectableItemIds';
import { useSelectedNavigationMenuItemEditItem } from '@/navigation-menu-item/hooks/useSelectedNavigationMenuItemEditItem';
import { parseThemeColor } from '@/navigation-menu-item/utils/parseThemeColor';
import { useLingui } from '@lingui/react/macro';

type CommandMenuEditObjectViewBaseProps = OrganizeActionsProps & {
  onOpenFolderPicker: () => void;
  showColorOption?: boolean;
};

export const CommandMenuEditObjectViewBase = ({
  onOpenFolderPicker,
  canMoveUp,
  canMoveDown,
  onMoveUp,
  onMoveDown,
  onRemove,
  onAddBefore,
  onAddAfter,
  showColorOption = false,
}: CommandMenuEditObjectViewBaseProps) => {
  const { t } = useLingui();
  const { selectedItem } = useSelectedNavigationMenuItemEditItem();
  const selectableItemIds = getOrganizeActionsSelectableItemIds(true);

  return (
    <CommandMenuList commandGroups={[]} selectableItemIds={selectableItemIds}>
      {showColorOption && selectedItem && (
        <CommandGroup heading={t`Customize`}>
          <CommandMenuEditColorOption
            navigationMenuItemId={selectedItem.id}
            color={parseThemeColor(selectedItem.color)}
          />
        </CommandGroup>
      )}
      <CommandMenuEditOrganizeActions
        canMoveUp={canMoveUp}
        canMoveDown={canMoveDown}
        onMoveUp={onMoveUp}
        onMoveDown={onMoveDown}
        onRemove={onRemove}
        onAddBefore={onAddBefore}
        onAddAfter={onAddAfter}
        showMoveToFolder
        onMoveToFolder={onOpenFolderPicker}
      />
    </CommandMenuList>
  );
};
