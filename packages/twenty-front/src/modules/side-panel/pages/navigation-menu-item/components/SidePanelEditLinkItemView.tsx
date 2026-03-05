import { useLingui } from '@lingui/react/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { useState } from 'react';
import { getAbsoluteUrl } from 'twenty-shared/utils';

import { SidePanelGroup } from '@/side-panel/components/SidePanelGroup';
import { SidePanelList } from '@/side-panel/components/SidePanelList';
import { SidePanelEditColorOption } from '@/side-panel/pages/navigation-menu-item/components/SidePanelEditColorOption';
import {
  type OrganizeActionsProps,
  SidePanelEditOrganizeActions,
} from '@/side-panel/pages/navigation-menu-item/components/SidePanelEditOrganizeActions';
import { SidePanelEditOwnerSection } from '@/side-panel/pages/navigation-menu-item/components/SidePanelEditOwnerSection';
import { getOrganizeActionsSelectableItemIds } from '@/side-panel/pages/navigation-menu-item/utils/getOrganizeActionsSelectableItemIds';
import { type ProcessedNavigationMenuItem } from '@/navigation-menu-item/types/processed-navigation-menu-item';
import { parseThemeColor } from '@/navigation-menu-item/utils/parseThemeColor';
import { TextInput } from '@/ui/input/components/TextInput';

type SidePanelEditLinkItemViewProps = OrganizeActionsProps & {
  selectedItem: ProcessedNavigationMenuItem;
  onUpdateLink: (linkId: string, link: string) => void;
  onOpenFolderPicker: () => void;
};

export const SidePanelEditLinkItemView = ({
  selectedItem,
  onUpdateLink,
  canMoveUp,
  canMoveDown,
  onOpenFolderPicker,
  onMoveUp,
  onMoveDown,
  onRemove,
  onAddBefore,
  onAddAfter,
}: SidePanelEditLinkItemViewProps) => {
  const { t } = useLingui();
  const [urlEditInput, setUrlEditInput] = useState('');

  const selectableItemIds = getOrganizeActionsSelectableItemIds(true);

  return (
    <SidePanelList commandGroups={[]} selectableItemIds={selectableItemIds}>
      <SidePanelGroup heading={t`Customize`}>
        <SidePanelEditColorOption
          navigationMenuItemId={selectedItem.id}
          color={parseThemeColor(selectedItem.color)}
        />
        <TextInput
          fullWidth
          placeholder="www.google.com"
          value={urlEditInput || selectedItem.link}
          onChange={(value) => setUrlEditInput(value)}
          onBlur={(event) => {
            const value = event.target.value.trim();
            if (isNonEmptyString(value)) {
              onUpdateLink(selectedItem.id, getAbsoluteUrl(value));
              setUrlEditInput('');
            }
          }}
        />
      </SidePanelGroup>
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
        moveToFolderHasSubMenu
      />
      <SidePanelEditOwnerSection applicationId={selectedItem.applicationId} />
    </SidePanelList>
  );
};
