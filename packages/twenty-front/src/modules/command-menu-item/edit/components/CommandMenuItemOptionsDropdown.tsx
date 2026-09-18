import { ListItem } from 'twenty-ui/primitives/navigation';
import { useResetCommandMenuItemToDefault } from '@/command-menu-item/edit/hooks/useResetCommandMenuItemToDefault';
import { useUpdateCommandMenuItemInDraft } from '@/command-menu-item/edit/hooks/useUpdateCommandMenuItemInDraft';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { GenericDropdownContentWidth } from '@/ui/layout/dropdown/constants/GenericDropdownContentWidth';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { useLingui } from '@lingui/react/macro';
import { type ReactElement } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { MenuItem, SettingsRow } from 'twenty-ui/components';
import { IconRefresh, IconTag } from 'twenty-ui/icon';
import { type CommandMenuItemFieldsFragment } from '~/generated-metadata/graphql';

type CommandMenuItemOptionsDropdownProps = Pick<
  CommandMenuItemFieldsFragment,
  'shortLabel'
> & {
  itemId: string;
  serverShortLabel: string | null | undefined;
  iconButton: ReactElement;
};

const getCommandMenuItemOptionsDropdownId = (itemId: string) =>
  `command-menu-item-options-${itemId}`;

export const CommandMenuItemOptionsDropdown = ({
  itemId,
  shortLabel,
  serverShortLabel,
  iconButton,
}: CommandMenuItemOptionsDropdownProps) => {
  const { t } = useLingui();

  const dropdownId = getCommandMenuItemOptionsDropdownId(itemId);
  const { closeDropdown } = useCloseDropdown();
  const { updateCommandMenuItemInDraft } = useUpdateCommandMenuItemInDraft();
  const { resetCommandMenuItemToDefault } = useResetCommandMenuItemToDefault();

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

  const handleResetToDefault = async () => {
    closeDropdown(dropdownId);
    await resetCommandMenuItemToDefault(itemId);
  };

  return (
    <Dropdown
      dropdownId={dropdownId}
      clickableComponent={iconButton}
      dropdownPlacement="bottom-end"
      dropdownComponents={
        <DropdownContent widthInPixels={GenericDropdownContentWidth.Medium}>
          <DropdownMenuItemsContainer>
            <SettingsRow
              startIcon={<IconTag />}
              disabled={hasNoShortLabel}
              checked={isLabelHidden || hasNoShortLabel}
              onCheckedChange={handleHiddenLabelChange}
            >{t`Hide label`}</SettingsRow>
            <ListItem
              startIcon={<IconRefresh />}
              onClick={handleResetToDefault}
            >{t`Reset to default`}</ListItem>
          </DropdownMenuItemsContainer>
        </DropdownContent>
      }
    />
  );
};
