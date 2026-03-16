import { parseThemeColor } from '@/navigation-menu-item/utils/parseThemeColor';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { SidePanelGroup } from '@/side-panel/components/SidePanelGroup';
import { SidePanelList } from '@/side-panel/components/SidePanelList';
import { SidePanelEditObjectColorOption } from '@/side-panel/pages/navigation-menu-item/components/SidePanelEditObjectColorOption';
import {
  type OrganizeActionsProps,
  SidePanelEditOrganizeActions,
} from '@/side-panel/pages/navigation-menu-item/components/SidePanelEditOrganizeActions';
import { getOrganizeActionsSelectableItemIds } from '@/side-panel/pages/navigation-menu-item/utils/getOrganizeActionsSelectableItemIds';
import { useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';

type SidePanelEditObjectViewBaseProps = OrganizeActionsProps & {
  onOpenFolderPicker: () => void;
  objectMetadataItem?: ObjectMetadataItem | null;
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
  objectMetadataItem,
}: SidePanelEditObjectViewBaseProps) => {
  const { t } = useLingui();
  const selectableItemIds = getOrganizeActionsSelectableItemIds(true);

  return (
    <SidePanelList commandGroups={[]} selectableItemIds={selectableItemIds}>
      {isDefined(objectMetadataItem) && (
        <SidePanelGroup heading={t`Customize`}>
          <SidePanelEditObjectColorOption
            objectMetadataId={objectMetadataItem.id}
            color={parseThemeColor(objectMetadataItem.color)}
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
