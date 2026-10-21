import { useResetCommandMenuItemToDefault } from '@/command-menu-item/edit/hooks/useResetCommandMenuItemToDefault';
import { useUpdateCommandMenuItemInDraft } from '@/command-menu-item/edit/hooks/useUpdateCommandMenuItemInDraft';
import { commandMenuItemVisibilityEditItemIdState } from '@/command-menu-item/edit/states/commandMenuItemVisibilityEditItemIdState';
import { useSidePanelSubPageHistory } from '@/side-panel/hooks/useSidePanelSubPageHistory';
import { SidePanelSubPages } from '@/side-panel/types/SidePanelSubPages';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownRoot } from '@/ui/layout/dropdown/components/DropdownRoot';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import { useLingui } from '@lingui/react/macro';
import { type ReactElement } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { Dropdown } from 'twenty-ui/components/navigation';
import { SettingsRow } from 'twenty-ui/components/settings';
import { IconEyeX, IconRefresh, IconTag } from 'twenty-ui/icon';
import { type CommandMenuItemFieldsFragment } from '~/generated-metadata/graphql';

type CommandMenuItemOptionsDropdownProps = Pick<
  CommandMenuItemFieldsFragment,
  'shortLabel' | 'isPinned'
> & {
  itemId: string;
  serverShortLabel: string | null | undefined;
  iconButton: ReactElement;
};

const getCommandMenuItemOptionsDropdownId = (itemId: string) =>
  `command-menu-item-options-${itemId}`;

export const CommandMenuItemOptionsDropdown = ({
  itemId,
  isPinned,
  shortLabel,
  serverShortLabel,
  iconButton,
}: CommandMenuItemOptionsDropdownProps) => {
  const { t } = useLingui();

  const dropdownId = getCommandMenuItemOptionsDropdownId(itemId);
  const { updateCommandMenuItemInDraft } = useUpdateCommandMenuItemInDraft();
  const { resetCommandMenuItemToDefault } = useResetCommandMenuItemToDefault();
  const { navigateToSidePanelSubPage } = useSidePanelSubPageHistory();
  const setCommandMenuItemVisibilityEditItemId = useSetAtomState(
    commandMenuItemVisibilityEditItemIdState,
  );

  const normalizedServerShortLabel = serverShortLabel ?? null;
  const normalizedShortLabel = shortLabel ?? null;
  const hasNoShortLabel = normalizedServerShortLabel === null;
  const isLabelHidden =
    normalizedShortLabel === null && isDefined(normalizedServerShortLabel);

  const handleHiddenLabelChange = (checked: boolean) => {
    updateCommandMenuItemInDraft(itemId, {
      shortLabel: checked ? null : normalizedServerShortLabel,
    });
  };

  const handleOpenVisibility = () => {
    setCommandMenuItemVisibilityEditItemId(itemId);
    navigateToSidePanelSubPage(SidePanelSubPages.CommandMenuItemVisibility);
  };

  return (
    <DropdownRoot dropdownId={dropdownId} type="panel">
      <Dropdown.Trigger render={iconButton} />
      <DropdownContent align="end">
        <Dropdown.Section>
          {isPinned && (
            <SettingsRow
              startElement={<IconTag />}
              disabled={hasNoShortLabel}
              checked={isLabelHidden || hasNoShortLabel}
              onCheckedChange={handleHiddenLabelChange}
            >{t`Hide label`}</SettingsRow>
          )}
          <Dropdown.ActionItem
            startIcon={<IconEyeX />}
            hasSubmenu
            onClick={handleOpenVisibility}
          >{t`Visibility`}</Dropdown.ActionItem>
          <Dropdown.ActionItem
            startIcon={<IconRefresh />}
            onClick={() => resetCommandMenuItemToDefault(itemId)}
          >{t`Reset to default`}</Dropdown.ActionItem>
        </Dropdown.Section>
      </DropdownContent>
    </DropdownRoot>
  );
};
