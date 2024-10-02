import styled from '@emotion/styled';
import { useRecoilValue } from 'recoil';

import { DropdownMenu } from '@/ui/layout/dropdown/components/DropdownMenu';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';

import { actionMenuEntriesState } from '../states/actionMenuEntriesState';
import { contextMenuIsOpenState } from '../states/contextMenuIsOpenState';
import { PositionType } from '../types/PositionType';

import { contextMenuPositionState } from '@/ui/navigation/action-menu/states/contextMenuPositionState';
import { ContextMenuItem } from './ContextMenuItem';

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

export const ContextMenu = () => {
  const contextMenuPosition = useRecoilValue(contextMenuPositionState);
  const contextMenuIsOpen = useRecoilValue(contextMenuIsOpenState);
  const actionMenuEntries = useRecoilValue(actionMenuEntriesState);

  if (!contextMenuIsOpen) {
    return null;
  }

  const width = actionMenuEntries.some(
    (actionMenuEntry) => actionMenuEntry.label === 'Remove from favorites',
  )
    ? 200
    : undefined;

  return (
    <>
      <StyledContainerContextMenu
        className="context-menu"
        position={contextMenuPosition}
      >
        <DropdownMenu data-select-disable width={width}>
          <DropdownMenuItemsContainer>
            {actionMenuEntries.map((item, index) => {
              return <ContextMenuItem key={index} item={item} />;
            })}
          </DropdownMenuItemsContainer>
        </DropdownMenu>
      </StyledContainerContextMenu>
    </>
  );
};
