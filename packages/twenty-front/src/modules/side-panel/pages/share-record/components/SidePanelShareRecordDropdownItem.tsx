import { type ReactNode, useId } from 'react';
import { isDefined } from 'twenty-shared/utils';
import {
  Dropdown,
  type DropdownType,
  ListItemButton,
} from 'twenty-ui/components/navigation';
import { type IconComponent } from 'twenty-ui/icon';
import { useTheme } from 'twenty-ui/theme';

import { useSidePanelListItemFocus } from '@/side-panel/hooks/useSidePanelListItemFocus';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownRoot } from '@/ui/layout/dropdown/components/DropdownRoot';
import { useOpenDropdown } from '@/ui/layout/dropdown/hooks/useOpenDropdown';
import { isDropdownOpenComponentState } from '@/ui/layout/dropdown/states/isDropdownOpenComponentState';
import { SelectableListItem } from '@/ui/layout/selectable-list/components/SelectableListItem';
import { ListItemIconContainer } from '@/ui/navigation/list-item/components/ListItemIconContainer';
import { ListItemSubmenuIndicator } from '@/ui/navigation/list-item/components/ListItemSubmenuIndicator';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';

type SidePanelShareRecordDropdownItemProps = {
  itemId: string;
  label: string;
  Icon: IconComponent;
  description?: string;
  disabled?: boolean;
  type?: DropdownType;
  width?: number;
  children: ReactNode;
};

export const SidePanelShareRecordDropdownItem = ({
  itemId,
  label,
  Icon,
  description,
  disabled = false,
  type = 'menu',
  width = 200,
  children,
}: SidePanelShareRecordDropdownItemProps) => {
  const theme = useTheme();
  const dropdownId = useId();
  const isDropdownOpen = useAtomComponentStateValue(
    isDropdownOpenComponentState,
    dropdownId,
  );
  const { openDropdown } = useOpenDropdown();
  const { nativeItemRef, isSelectedItemId, handleFocus } =
    useSidePanelListItemFocus(itemId);

  return (
    <SelectableListItem
      itemId={itemId}
      onEnter={
        disabled
          ? undefined
          : () =>
              openDropdown({ dropdownComponentInstanceIdFromProps: dropdownId })
      }
    >
      <DropdownRoot dropdownId={dropdownId} type={type}>
        <Dropdown.Trigger
          ref={nativeItemRef}
          render={
            <ListItemButton
              startIcon={
                <ListItemIconContainer>
                  <Icon
                    size={theme.icon.size.md}
                    stroke={theme.icon.stroke.sm}
                  />
                </ListItemIconContainer>
              }
              description={description}
              descriptionPlacement="end"
              endIcon={
                !disabled && (
                  <ListItemSubmenuIndicator isOpen={isDropdownOpen} />
                )
              }
              focused={!disabled && isSelectedItemId}
              focusableWhenDisabled
            >
              {label}
            </ListItemButton>
          }
          disabled={disabled}
          onFocus={handleFocus}
          aria-label={
            isDefined(description) ? `${label} ${description}` : label
          }
        />
        <DropdownContent align="end" width={width} aria-label={label}>
          {children}
        </DropdownContent>
      </DropdownRoot>
    </SelectableListItem>
  );
};
