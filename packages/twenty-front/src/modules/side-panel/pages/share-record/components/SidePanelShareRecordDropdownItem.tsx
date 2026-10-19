import { styled } from '@linaria/react';
import { type ReactNode, useId } from 'react';
import { isDefined } from 'twenty-shared/utils';
import {
  Dropdown,
  type DropdownType,
  ListItemButton,
} from 'twenty-ui/components/navigation';
import { IconChevronRight, type IconComponent } from 'twenty-ui/icon';
import { themeCssVariables, useTheme } from 'twenty-ui/theme';

import { hasUserSelectedSidePanelListItemState } from '@/side-panel/states/hasUserSelectedSidePanelListItemState';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownRoot } from '@/ui/layout/dropdown/components/DropdownRoot';
import { useOpenDropdown } from '@/ui/layout/dropdown/hooks/useOpenDropdown';
import { isDropdownOpenComponentState } from '@/ui/layout/dropdown/states/isDropdownOpenComponentState';
import { SelectableListItem } from '@/ui/layout/selectable-list/components/SelectableListItem';
import { useSelectableList } from '@/ui/layout/selectable-list/hooks/useSelectableList';
import { useSelectableListNativeItemRef } from '@/ui/layout/selectable-list/hooks/useSelectableListNativeItemRef';
import { isSelectedItemIdComponentFamilyState } from '@/ui/layout/selectable-list/states/isSelectedItemIdComponentFamilyState';
import { ListItemIconContainer } from '@/ui/navigation/list-item/components/ListItemIconContainer';
import { useAtomComponentFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentFamilyStateValue';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';

const StyledSubmenuIcon = styled.span`
  color: ${themeCssVariables.font.color.light};
  display: inline-flex;

  &[data-opened='true'] {
    transform: rotate(90deg);
  }
`;

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
  const nativeItemRef = useSelectableListNativeItemRef(itemId);
  const isSelectedItemId = useAtomComponentFamilyStateValue(
    isSelectedItemIdComponentFamilyState,
    itemId,
  );
  const { setSelectedItemId } = useSelectableList();
  const setHasUserSelectedSidePanelListItem = useSetAtomState(
    hasUserSelectedSidePanelListItemState,
  );

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
                  <StyledSubmenuIcon aria-hidden data-opened={isDropdownOpen}>
                    <IconChevronRight
                      size={theme.icon.size.sm}
                      stroke={theme.icon.stroke.sm}
                    />
                  </StyledSubmenuIcon>
                )
              }
              focused={!disabled && isSelectedItemId}
              focusableWhenDisabled
            >
              {label}
            </ListItemButton>
          }
          disabled={disabled}
          onFocus={() => {
            setSelectedItemId(itemId);
            setHasUserSelectedSidePanelListItem(true);
          }}
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
