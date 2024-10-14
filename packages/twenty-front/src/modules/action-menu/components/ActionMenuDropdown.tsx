import styled from '@emotion/styled';
import { useRecoilValue } from 'recoil';

import { PositionType } from '../types/PositionType';

import { actionMenuDropdownPositionComponentState } from '@/action-menu/states/actionMenuDropdownPositionComponentState';
import { actionMenuEntriesComponentSelector } from '@/action-menu/states/actionMenuEntriesComponentSelector';
import { ActionMenuComponentInstanceContext } from '@/action-menu/states/contexts/ActionMenuComponentInstanceContext';
import { ActionMenuDropdownHotkeyScope } from '@/action-menu/types/ActionMenuDropdownHotKeyScope';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { MenuItem } from '@/ui/navigation/menu-item/components/MenuItem';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { extractComponentState } from '@/ui/utilities/state/component-state/utils/extractComponentState';

type StyledContainerProps = {
  position: PositionType;
};

const StyledContainerActionMenuDropdown = styled.div<StyledContainerProps>`
  align-items: flex-start;
  background: ${({ theme }) => theme.background.secondary};
  border: 1px solid ${({ theme }) => theme.border.color.light};
  border-radius: ${({ theme }) => theme.border.radius.md};
  box-shadow: ${({ theme }) => theme.boxShadow.strong};
  display: flex;
  flex-direction: column;

  left: ${(props) => `${props.position.x}px`};
  position: fixed;
  top: ${(props) => `${props.position.y}px`};

  transform: translateX(-50%);
  width: auto;
`;

export const ActionMenuDropdown = () => {
  const actionMenuEntries = useRecoilComponentValueV2(
    actionMenuEntriesComponentSelector,
  );

  const actionMenuId = useAvailableComponentInstanceIdOrThrow(
    ActionMenuComponentInstanceContext,
  );

  const actionMenuDropdownPosition = useRecoilValue(
    extractComponentState(
      actionMenuDropdownPositionComponentState,
      `action-menu-dropdown-${actionMenuId}`,
    ),
  );

  if (actionMenuEntries.length === 0) {
    return null;
  }

  //TODO: remove this
  const width = actionMenuEntries.some(
    (actionMenuEntry) => actionMenuEntry.label === 'Remove from favorites',
  )
    ? 200
    : undefined;

  return (
    <StyledContainerActionMenuDropdown
      position={actionMenuDropdownPosition}
      className="context-menu"
    >
      <Dropdown
        dropdownId={`action-menu-dropdown-${actionMenuId}`}
        dropdownHotkeyScope={{
          scope: ActionMenuDropdownHotkeyScope.ActionMenuDropdown,
        }}
        data-select-disable
        dropdownMenuWidth={width}
        dropdownComponents={actionMenuEntries.map((item, index) => (
          <MenuItem
            key={index}
            LeftIcon={item.Icon}
            onClick={item.onClick}
            accent={item.accent}
            text={item.label}
          />
        ))}
      />
    </StyledContainerActionMenuDropdown>
  );
};
