import { useLingui } from '@lingui/react/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { useState } from 'react';
import { ensureAbsoluteUrl } from 'twenty-shared/utils';
import { type NavigationMenuItem } from '~/generated-metadata/graphql';

import { extractDomainFromUrl } from '@/navigation-menu-item/display/link/utils/extractDomainFromUrl';
import {
  type OrganizeActionsProps,
  SidePanelEditOrganizeActions,
} from '@/navigation-menu-item/edit/side-panel/components/SidePanelEditOrganizeActions';
import { SidePanelEditOwnerSection } from '@/navigation-menu-item/edit/side-panel/components/SidePanelEditOwnerSection';
import { getOrganizeActionsSelectableItemIds } from '@/navigation-menu-item/edit/side-panel/utils/getOrganizeActionsSelectableItemIds';
import { SidePanelGroup } from '@/side-panel/components/SidePanelGroup';
import { SidePanelList } from '@/side-panel/components/SidePanelList';
import { TextInput } from '@/ui/input/components/TextInput';

type SidePanelEditLinkItemViewProps = OrganizeActionsProps & {
  selectedItem: NavigationMenuItem;
  onUpdateLink: (
    linkId: string,
    updates: { link?: string; name?: string },
  ) => void;
  onOpenFolderPicker: () => void;
  showMoveToFolder?: boolean;
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
  showMoveToFolder = false,
}: SidePanelEditLinkItemViewProps) => {
  const { t } = useLingui();
  const [urlEditInput, setUrlEditInput] = useState('');
  const [lastAutoSetName, setLastAutoSetName] = useState<string | null>(null);

  const defaultLabel = t`Link label`;
  const selectableItemIds =
    getOrganizeActionsSelectableItemIds(showMoveToFolder);

  const currentName = selectedItem.name ?? defaultLabel;
  const currentDomain = selectedItem.link
    ? extractDomainFromUrl(ensureAbsoluteUrl(selectedItem.link))
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
    const domain = extractDomainFromUrl(ensureAbsoluteUrl(trimmed));
    if (domain !== undefined) {
      setLastAutoSetName(domain);
      onUpdateLink(selectedItem.id, { name: domain });
    }
  };

  const handleUrlBlur = (event: React.FocusEvent<HTMLInputElement>) => {
    const value = event.target.value.trim();
    if (isNonEmptyString(value)) {
      onUpdateLink(selectedItem.id, { link: ensureAbsoluteUrl(value) });
      setUrlEditInput('');
    }
  };

  return (
    <SidePanelList selectableItemIds={selectableItemIds}>
      <SidePanelGroup heading={t`Customize`}>
        <TextInput
          fullWidth
          placeholder="www.google.com"
          value={urlEditInput || selectedItem.link || ''}
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
        showMoveToFolder={showMoveToFolder}
        onMoveToFolder={onOpenFolderPicker}
      />
      <SidePanelEditOwnerSection applicationId={selectedItem.applicationId} />
    </SidePanelList>
  );
};
