import styled from '@emotion/styled';
import { useRecoilValue } from 'recoil';

import { PositionType } from '../types/PositionType';

import { actionMenuDropdownPositionState } from '@/action-menu/states/actionMenuDropdownPositionState';
import { actionMenuEntriesState } from '@/action-menu/states/actionMenuEntriesState';
import { ActionMenuDropdownHotkeyScope } from '@/action-menu/types/ActionMenuDropdownHotKeyScope';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { MenuItem } from '@/ui/navigation/menu-item/components/MenuItem';

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
  gap: 1px;

  left: ${(props) => `${props.position.x}px`};
  position: fixed;
  top: ${(props) => `${props.position.y}px`};

  transform: translateX(-50%);
  width: auto;
  z-index: 2;
`;

export type ActionMenuDropdownProps = {
  actionMenuDropdownId: string;
  onOpen: () => void;
};

export const ActionMenuDropdown = ({
  actionMenuDropdownId,
  onOpen,
}: ActionMenuDropdownProps) => {
  const actionMenuEntries = useRecoilValue(actionMenuEntriesState);

  const actionMenuDropdownPosition = useRecoilValue(
    actionMenuDropdownPositionState,
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
      className="context-menu"
    >
      <Dropdown
        dropdownId={`action-menu-dropdown-${actionMenuDropdownId}`}
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
        onOpen={onOpen}
      />
    </StyledContainerActionMenuDropdown>
  );
};
