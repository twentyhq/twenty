import styled from '@emotion/styled';
import { useRecoilValue } from 'recoil';

import { PositionType } from '../types/PositionType';

import { actionMenuEntriesComponentSelector } from '@/action-menu/states/actionMenuEntriesComponentSelector';
import { ActionMenuComponentInstanceContext } from '@/action-menu/states/contexts/ActionMenuComponentInstanceContext';
import { recordIndexActionMenuDropdownPositionComponentState } from '@/action-menu/states/recordIndexActionMenuDropdownPositionComponentState';
import { ActionMenuDropdownHotkeyScope } from '@/action-menu/types/ActionMenuDropdownHotKeyScope';
import { getActionMenuDropdownIdFromActionMenuId } from '@/action-menu/utils/getActionMenuDropdownIdFromActionMenuId';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { extractComponentState } from '@/ui/utilities/state/component-state/utils/extractComponentState';
import { MenuItem } from 'twenty-ui';

type StyledContainerProps = {
  position: PositionType;
};

const StyledContainerActionMenuDropdown = styled.div<StyledContainerProps>`
  align-items: flex-start;
  display: flex;
  flex-direction: column;

  left: ${(props) => `${props.position.x}px`};
  position: fixed;
  top: ${(props) => `${props.position.y}px`};

  transform: translateX(-50%);
  width: 0;
  height: 0;
`;

export const RecordIndexActionMenuDropdown = () => {
  const actionMenuEntries = useRecoilComponentValueV2(
    actionMenuEntriesComponentSelector,
  );

  const actionMenuId = useAvailableComponentInstanceIdOrThrow(
    ActionMenuComponentInstanceContext,
  );

  const actionMenuDropdownPosition = useRecoilValue(
    extractComponentState(
      recordIndexActionMenuDropdownPositionComponentState,
      getActionMenuDropdownIdFromActionMenuId(actionMenuId),
    ),
  );

  //TODO: remove this
  const width = actionMenuEntries.some(
    (actionMenuEntry) => actionMenuEntry.label === 'Remove from favorites',
  )
    ? 200
    : undefined;

  return (
    <StyledContainerActionMenuDropdown
      position={actionMenuDropdownPosition}
      className="action-menu-dropdown"
    >
      <Dropdown
        dropdownId={getActionMenuDropdownIdFromActionMenuId(actionMenuId)}
        dropdownHotkeyScope={{
          scope: ActionMenuDropdownHotkeyScope.ActionMenuDropdown,
        }}
        data-select-disable
        dropdownMenuWidth={width}
        dropdownComponents={
          <DropdownMenuItemsContainer>
            {actionMenuEntries.map((item, index) => (
              <MenuItem
                key={index}
                LeftIcon={item.Icon}
                onClick={item.onClick}
                accent={item.accent}
                text={item.label}
              />
            ))}
          </DropdownMenuItemsContainer>
        }
        avoidPortal
      />
    </StyledContainerActionMenuDropdown>
  );
};
