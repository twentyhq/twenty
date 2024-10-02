import styled from '@emotion/styled';
import { useRecoilValue } from 'recoil';

import { DropdownMenu } from '@/ui/layout/dropdown/components/DropdownMenu';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';

import { PositionType } from '../types/PositionType';

import { contextMenuPositionState } from '@/ui/navigation/action-menu/states/contextMenuPositionState';
import { ActionMenuEntry } from '@/ui/navigation/action-menu/types/ActionMenuEntry';
import { MenuItem } from '@/ui/navigation/menu-item/components/MenuItem';

type StyledContainerProps = {
  position: PositionType;
};

const StyledContainerContextMenu = styled.div<StyledContainerProps>`
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

export const ActionMenuDropdown = ({
  actionMenuEntries,
}: {
  actionMenuEntries: ActionMenuEntry[];
}) => {
  const contextMenuPosition = useRecoilValue(contextMenuPositionState);

  //TODO: remove this
  const width = actionMenuEntries.some(
    (actionMenuEntry) => actionMenuEntry.label === 'Remove from favorites',
  )
    ? 200
    : undefined;

  return (
    <>
      <StyledContainerContextMenu position={contextMenuPosition}>
        <DropdownMenu data-select-disable width={width}>
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
        </DropdownMenu>
      </StyledContainerContextMenu>
    </>
  );
};
