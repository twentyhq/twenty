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
import { IconRefresh, IconTag } from 'twenty-ui/icon';
import { Switch } from 'twenty-ui/primitives/input';
import { MenuItem, ListItem } from 'twenty-ui/primitives/navigation';
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
            <ListItem
              startIcon={<IconTag />}
              disabled={hasNoShortLabel}
              render={<label />}
              endIcon={
                <Switch
                  checked={isLabelHidden || hasNoShortLabel}
                  onCheckedChange={handleHiddenLabelChange}
                  size="sm"
                  disabled={hasNoShortLabel}
                />
              }
            >{t`Hide label`}</ListItem>
            <MenuItem
              LeftIcon={IconRefresh}
              onClick={handleResetToDefault}
              accent="default"
              text={t`Reset to default`}
            />
          </DropdownMenuItemsContainer>
        </DropdownContent>
      }
    />
  );
};
