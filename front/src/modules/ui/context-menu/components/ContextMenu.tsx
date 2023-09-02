import React, { useRef } from 'react';
import styled from '@emotion/styled';
import { useRecoilValue, useSetRecoilState } from 'recoil';

import { actionBarOpenState } from '@/ui/action-bar/states/actionBarIsOpenState';
import { contextMenuPositionState } from '@/ui/context-menu/states/contextMenuPositionState';
import { StyledDropdownMenu } from '@/ui/dropdown/components/StyledDropdownMenu';
import { StyledDropdownMenuItemsContainer } from '@/ui/dropdown/components/StyledDropdownMenuItemsContainer';
import { useListenClickOutside } from '@/ui/utilities/pointer-event/hooks/useListenClickOutside';

import { contextMenuEntriesState } from '../states/contextMenuEntriesState';
import { contextMenuIsOpenState } from '../states/contextMenuIsOpenState';
import { PositionType } from '../types/PositionType';

type OwnProps = {
  selectedIds: string[];
};

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
  width: 160px;
  z-index: 1;
`;

export function ContextMenu({ selectedIds }: OwnProps) {
  const position = useRecoilValue(contextMenuPositionState);
  const contextMenuOpen = useRecoilValue(contextMenuIsOpenState);
  const contextMenuEntries = useRecoilValue(contextMenuEntriesState);
  const setContextMenuOpenState = useSetRecoilState(contextMenuIsOpenState);
  const setActionBarOpenState = useSetRecoilState(actionBarOpenState);
  const wrapperRef = useRef(null);

  useListenClickOutside({
    refs: [wrapperRef],
    callback: () => {
      setContextMenuOpenState(false);
      setActionBarOpenState(true);
    },
  });

  if (selectedIds.length === 0 || !contextMenuOpen) {
    return null;
  }
  return (
    <StyledContainerContextMenu
      className="context-menu"
      ref={wrapperRef}
      position={position}
    >
      <StyledDropdownMenu>
        <StyledDropdownMenuItemsContainer>
          {contextMenuEntries}
        </StyledDropdownMenuItemsContainer>
      </StyledDropdownMenu>
    </StyledContainerContextMenu>
  );
}
