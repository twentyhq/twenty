import { useLingui } from '@lingui/react/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { useState } from 'react';
import { getAbsoluteUrl } from 'twenty-shared/utils';

import { CommandGroup } from '@/command-menu/components/CommandGroup';
import { CommandMenuList } from '@/command-menu/components/CommandMenuList';
import {
  type OrganizeActionsProps,
  CommandMenuEditOrganizeActions,
} from '@/command-menu/pages/navigation-menu-item/components/CommandMenuEditOrganizeActions';
import { getOrganizeActionsSelectableItemIds } from '@/command-menu/pages/navigation-menu-item/utils/getOrganizeActionsSelectableItemIds';
import { CommandMenuEditOwnerSection } from '@/command-menu/pages/navigation-menu-item/components/CommandMenuEditOwnerSection';
import { type ProcessedNavigationMenuItem } from '@/navigation-menu-item/types/processed-navigation-menu-item';
import { TextInput } from '@/ui/input/components/TextInput';

type CommandMenuEditLinkItemViewProps = OrganizeActionsProps & {
  selectedItem: ProcessedNavigationMenuItem;
  onUpdateLink: (linkId: string, link: string) => void;
  onOpenFolderPicker: () => void;
};

export const CommandMenuEditLinkItemView = ({
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
}: CommandMenuEditLinkItemViewProps) => {
  const { t } = useLingui();
  const [urlEditInput, setUrlEditInput] = useState('');

  const selectableItemIds = getOrganizeActionsSelectableItemIds(true);

  return (
    <CommandMenuList commandGroups={[]} selectableItemIds={selectableItemIds}>
      <CommandGroup heading={t`Customize`}>
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
      </CommandGroup>
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
        moveToFolderHasSubMenu
      />
      <CommandMenuEditOwnerSection applicationId={selectedItem.applicationId} />
    </CommandMenuList>
  );
};
