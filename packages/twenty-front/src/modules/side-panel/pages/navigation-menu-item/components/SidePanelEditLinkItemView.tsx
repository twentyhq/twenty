import { useLingui } from '@lingui/react/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { useState } from 'react';
import { getAbsoluteUrl } from 'twenty-shared/utils';

import { type ProcessedNavigationMenuItem } from '@/navigation-menu-item/types/processed-navigation-menu-item';
import { extractDomainFromUrl } from '@/navigation-menu-item/utils/extractDomainFromUrl';
import { SidePanelGroup } from '@/side-panel/components/SidePanelGroup';
import { SidePanelList } from '@/side-panel/components/SidePanelList';
import {
  type OrganizeActionsProps,
  SidePanelEditOrganizeActions,
} from '@/side-panel/pages/navigation-menu-item/components/SidePanelEditOrganizeActions';
import { SidePanelEditOwnerSection } from '@/side-panel/pages/navigation-menu-item/components/SidePanelEditOwnerSection';
import { getOrganizeActionsSelectableItemIds } from '@/side-panel/pages/navigation-menu-item/utils/getOrganizeActionsSelectableItemIds';
import { TextInput } from '@/ui/input/components/TextInput';

type SidePanelEditLinkItemViewProps = OrganizeActionsProps & {
  selectedItem: ProcessedNavigationMenuItem;
  onUpdateLink: (
    linkId: string,
    updates: { link?: string; name?: string },
  ) => void;
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
  const [lastAutoSetName, setLastAutoSetName] = useState<string | null>(null);

  const defaultLabel = t`Link label`;
  const selectableItemIds = getOrganizeActionsSelectableItemIds(true);

  const currentName = selectedItem.name ?? defaultLabel;
  const currentDomain = selectedItem.link
    ? extractDomainFromUrl(getAbsoluteUrl(selectedItem.link))
    : undefined;
  const canAutoUpdateName =
    currentName === defaultLabel ||
    currentName === currentDomain ||
    currentName === lastAutoSetName;

  const handleUrlChange = (value: string) => {
    setUrlEditInput(value);
    if (!canAutoUpdateName) return;
    const trimmed = value.trim();
    if (!isNonEmptyString(trimmed)) return;
    const domain = extractDomainFromUrl(getAbsoluteUrl(trimmed));
    if (domain !== undefined) {
      setLastAutoSetName(domain);
      onUpdateLink(selectedItem.id, { name: domain });
    }
  };

  const handleUrlBlur = (event: React.FocusEvent<HTMLInputElement>) => {
    const value = event.target.value.trim();
    if (isNonEmptyString(value)) {
      onUpdateLink(selectedItem.id, { link: getAbsoluteUrl(value) });
      setUrlEditInput('');
    }
  };

  return (
    <SidePanelList commandGroups={[]} selectableItemIds={selectableItemIds}>
      <SidePanelGroup heading={t`Customize`}>
        <TextInput
          fullWidth
          placeholder="www.google.com"
          value={urlEditInput || selectedItem.link}
          onChange={handleUrlChange}
          onBlur={handleUrlBlur}
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
