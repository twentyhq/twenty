import { useResetCommandMenuItemToDefault } from '@/command-menu-item/edit/hooks/useResetCommandMenuItemToDefault';
import { useUpdateCommandMenuItemInDraft } from '@/command-menu-item/edit/hooks/useUpdateCommandMenuItemInDraft';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownRoot } from '@/ui/layout/dropdown/components/DropdownRoot';
import { useLingui } from '@lingui/react/macro';
import { type ReactElement } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { Dropdown, SettingsRow } from 'twenty-ui/components';
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

  return (
    <DropdownRoot dropdownId={dropdownId} type="panel">
      <Dropdown.Trigger render={iconButton} />
      <DropdownContent align="end">
        <Dropdown.Section>
          <SettingsRow
            startIcon={<IconTag />}
            disabled={hasNoShortLabel}
            checked={isLabelHidden || hasNoShortLabel}
            onCheckedChange={handleHiddenLabelChange}
          >{t`Hide label`}</SettingsRow>
          <Dropdown.ActionItem
            startIcon={<IconRefresh />}
            onClick={() => resetCommandMenuItemToDefault(itemId)}
          >{t`Reset to default`}</Dropdown.ActionItem>
        </Dropdown.Section>
      </DropdownContent>
    </DropdownRoot>
  );
};
