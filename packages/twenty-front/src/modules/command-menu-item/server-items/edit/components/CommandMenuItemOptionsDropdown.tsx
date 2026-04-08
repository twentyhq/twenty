import { useUpdateCommandMenuItemInDraft } from '@/command-menu-item/server-items/edit/hooks/useUpdateCommandMenuItemInDraft';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { GenericDropdownContentWidth } from '@/ui/layout/dropdown/constants/GenericDropdownContentWidth';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { useLingui } from '@lingui/react/macro';
import { type ReactElement } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { IconRefresh, IconTag } from 'twenty-ui/display';
import { MenuItem, MenuItemToggle } from 'twenty-ui/navigation';
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

  const normalizedServerShortLabel = serverShortLabel ?? null;
  const normalizedShortLabel = shortLabel ?? null;
  const hasNoShortLabel = normalizedServerShortLabel === null;
  const isLabelHidden =
    normalizedShortLabel === null && isDefined(normalizedServerShortLabel);
  const hasShortLabelOverride =
    normalizedShortLabel !== normalizedServerShortLabel;

  const handleToggleHideLabel = (toggled: boolean) => {
    updateCommandMenuItemInDraft(itemId, {
      shortLabel: toggled ? null : normalizedServerShortLabel,
    });
  };

  const handleResetLabelToDefault = () => {
    updateCommandMenuItemInDraft(itemId, {
      shortLabel: normalizedServerShortLabel,
    });
    closeDropdown(dropdownId);
  };

  return (
    <Dropdown
      dropdownId={dropdownId}
      clickableComponent={iconButton}
      dropdownPlacement="bottom-end"
      dropdownComponents={
        <DropdownContent widthInPixels={GenericDropdownContentWidth.Medium}>
          <DropdownMenuItemsContainer>
            <MenuItemToggle
              LeftIcon={IconTag}
              text={t`Hide label`}
              toggled={isLabelHidden || hasNoShortLabel}
              onToggleChange={handleToggleHideLabel}
              toggleSize="small"
              disabled={hasNoShortLabel}
            />
            <MenuItem
              LeftIcon={IconRefresh}
              onClick={handleResetLabelToDefault}
              accent="default"
              text={t`Reset label to default`}
              disabled={!hasShortLabelOverride}
            />
          </DropdownMenuItemsContainer>
        </DropdownContent>
      }
    />
  );
};
