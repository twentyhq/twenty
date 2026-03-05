import { SidePanelGroup } from '@/side-panel/components/SidePanelGroup';
import { SidePanelList } from '@/side-panel/components/SidePanelList';
import { SidePanelEditColorOption } from '@/side-panel/pages/navigation-menu-item/components/SidePanelEditColorOption';
import {
  type OrganizeActionsProps,
  SidePanelEditOrganizeActions,
} from '@/side-panel/pages/navigation-menu-item/components/SidePanelEditOrganizeActions';
import { getOrganizeActionsSelectableItemIds } from '@/side-panel/pages/navigation-menu-item/utils/getOrganizeActionsSelectableItemIds';
import { useSelectedNavigationMenuItemEditItem } from '@/navigation-menu-item/hooks/useSelectedNavigationMenuItemEditItem';
import { parseThemeColor } from '@/navigation-menu-item/utils/parseThemeColor';
import { useLingui } from '@lingui/react/macro';

type SidePanelEditObjectViewBaseProps = OrganizeActionsProps & {
  onOpenFolderPicker: () => void;
  showColorOption?: boolean;
};

export const SidePanelEditObjectViewBase = ({
  onOpenFolderPicker,
  canMoveUp,
  canMoveDown,
  onMoveUp,
  onMoveDown,
  onRemove,
  onAddBefore,
  onAddAfter,
  showColorOption = false,
}: SidePanelEditObjectViewBaseProps) => {
  const { t } = useLingui();
  const { selectedItem } = useSelectedNavigationMenuItemEditItem();
  const selectableItemIds = getOrganizeActionsSelectableItemIds(true);

  return (
    <SidePanelList commandGroups={[]} selectableItemIds={selectableItemIds}>
      {showColorOption && selectedItem && (
        <SidePanelGroup heading={t`Customize`}>
          <SidePanelEditColorOption
            navigationMenuItemId={selectedItem.id}
            color={parseThemeColor(selectedItem.color)}
          />
        </SidePanelGroup>
      )}
      <SidePanelEditOrganizeActions
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
    </SidePanelList>
  );
};
