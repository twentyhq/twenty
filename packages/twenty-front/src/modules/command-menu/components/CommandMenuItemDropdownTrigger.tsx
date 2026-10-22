import { type CommandMenuItemProps } from '@/command-menu/types/CommandMenuItemProps';
import { getCommandMenuItemStartIcon } from '@/command-menu/utils/getCommandMenuItemStartIcon';
import { useSidePanelListItemFocus } from '@/side-panel/hooks/useSidePanelListItemFocus';
import { DropdownComponentInstanceContext } from '@/ui/layout/dropdown/contexts/DropdownComponentInstanceContext';
import { isDropdownOpenComponentState } from '@/ui/layout/dropdown/states/isDropdownOpenComponentState';
import { ListItemSubmenuIndicator } from '@/ui/navigation/list-item/components/ListItemSubmenuIndicator';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { Dropdown, ListItemButton } from 'twenty-ui/components/navigation';
import { useTheme } from 'twenty-ui/theme';

type CommandMenuItemDropdownTriggerProps = Pick<
  CommandMenuItemProps,
  | 'id'
  | 'label'
  | 'Icon'
  | 'LeftComponent'
  | 'description'
  | 'contextualTextPosition'
  | 'disabled'
>;

export const CommandMenuItemDropdownTrigger = ({
  id,
  label,
  Icon,
  LeftComponent,
  description,
  contextualTextPosition = 'left',
  disabled = false,
}: CommandMenuItemDropdownTriggerProps) => {
  const theme = useTheme();
  const dropdownId = useAvailableComponentInstanceIdOrThrow(
    DropdownComponentInstanceContext,
  );
  const isDropdownOpen = useAtomComponentStateValue(
    isDropdownOpenComponentState,
    dropdownId,
  );
  const { nativeItemRef, isSelectedItemId, handleFocus } =
    useSidePanelListItemFocus(id);

  return (
    <Dropdown.Trigger
      ref={nativeItemRef}
      disabled={disabled}
      onFocus={handleFocus}
      onClick={handleFocus}
      render={
        <ListItemButton
          startIcon={getCommandMenuItemStartIcon({
            LeftComponent,
            Icon,
            iconSize: theme.icon.size.md,
            iconStroke: theme.icon.stroke.sm,
          })}
          description={description}
          descriptionPlacement={
            contextualTextPosition === 'right' ? 'end' : 'inline'
          }
          focused={!disabled && isSelectedItemId}
          endIcon={
            <ListItemSubmenuIndicator
              isOpen={isDropdownOpen}
              disabled={disabled}
            />
          }
        />
      }
    >
      {label}
    </Dropdown.Trigger>
  );
};
