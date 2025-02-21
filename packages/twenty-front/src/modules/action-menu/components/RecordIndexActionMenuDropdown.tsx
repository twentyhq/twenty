import { actionMenuEntriesComponentSelector } from '@/action-menu/states/actionMenuEntriesComponentSelector';
import { ActionMenuComponentInstanceContext } from '@/action-menu/states/contexts/ActionMenuComponentInstanceContext';
import { recordIndexActionMenuDropdownPositionComponentState } from '@/action-menu/states/recordIndexActionMenuDropdownPositionComponentState';
import { ActionMenuDropdownHotkeyScope } from '@/action-menu/types/ActionMenuDropdownHotKeyScope';
import {
  ActionMenuEntryScope,
  ActionMenuEntryType,
} from '@/action-menu/types/ActionMenuEntry';
import { getActionMenuDropdownIdFromActionMenuId } from '@/action-menu/utils/getActionMenuDropdownIdFromActionMenuId';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { useDropdown } from '@/ui/layout/dropdown/hooks/useDropdown';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { extractComponentState } from '@/ui/utilities/state/component-state/utils/extractComponentState';
import styled from '@emotion/styled';
import { i18n } from '@lingui/core';
import { useRecoilValue } from 'recoil';
import { MenuItem } from 'twenty-ui';

const StyledDropdownMenuContainer = styled.div`
  width: 100%;
  height: 100%;

  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;

export const RecordIndexActionMenuDropdown = () => {
  const actionMenuEntries = useRecoilComponentValueV2(
    actionMenuEntriesComponentSelector,
  );

  const recordIndexActions = actionMenuEntries.filter(
    (actionMenuEntry) =>
      actionMenuEntry.type === ActionMenuEntryType.Standard &&
      actionMenuEntry.scope === ActionMenuEntryScope.RecordSelection,
  );

  const actionMenuId = useAvailableComponentInstanceIdOrThrow(
    ActionMenuComponentInstanceContext,
  );

  const dropdownId = getActionMenuDropdownIdFromActionMenuId(actionMenuId);
  const { closeDropdown } = useDropdown(dropdownId);

  const actionMenuDropdownPosition = useRecoilValue(
    extractComponentState(
      recordIndexActionMenuDropdownPositionComponentState,
      dropdownId,
    ),
  );

  //TODO: remove this
  const width = recordIndexActions.some(
    (actionMenuEntry) =>
      i18n._(actionMenuEntry.label) === 'Remove from favorites',
  )
    ? 200
    : undefined;

  return (
    <Dropdown
      dropdownId={dropdownId}
      dropdownHotkeyScope={{
        scope: ActionMenuDropdownHotkeyScope.ActionMenuDropdown,
      }}
      data-select-disable
      dropdownMenuWidth={width}
      dropdownPlacement="bottom-start"
      dropdownStrategy="absolute"
      dropdownOffset={{
        x: actionMenuDropdownPosition.x ?? 0,
        y: actionMenuDropdownPosition.y ?? 0,
      }}
      dropdownComponents={
        <StyledDropdownMenuContainer className="action-menu-dropdown">
          <DropdownMenuItemsContainer>
            {recordIndexActions.map((item) => (
              <MenuItem
                key={item.key}
                LeftIcon={item.Icon}
                onClick={() => {
                  item.onClick?.();
                  closeDropdown();
                }}
                accent={item.accent}
                text={i18n._(item.label)}
              />
            ))}
          </DropdownMenuItemsContainer>
        </StyledDropdownMenuContainer>
      }
    />
  );
};
