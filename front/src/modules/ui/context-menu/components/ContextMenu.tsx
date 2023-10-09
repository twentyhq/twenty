import React, { useRef } from 'react';
import styled from '@emotion/styled';
import { useRecoilValue, useSetRecoilState } from 'recoil';

import { actionBarOpenState } from '@/ui/action-bar/states/actionBarIsOpenState';
import { contextMenuPositionState } from '@/ui/context-menu/states/contextMenuPositionState';
import { DropdownMenuItemsContainer } from '@/ui/dropdown/components/DropdownMenuItemsContainer';
import { StyledDropdownMenu } from '@/ui/dropdown/components/StyledDropdownMenu';
import { useListenClickOutside } from '@/ui/utilities/pointer-event/hooks/useListenClickOutside';

import { contextMenuEntriesState } from '../states/contextMenuEntriesState';
import { contextMenuIsOpenState } from '../states/contextMenuIsOpenState';
import { PositionType } from '../types/PositionType';

import { ContextMenuItem } from './ContextMenuItem';

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
  width: auto;
  z-index: 1;
`;

export const ContextMenu = ({ selectedIds }: OwnProps) => {
  const contextMenuPosition = useRecoilValue(contextMenuPositionState);
  const contextMenuIsOpen = useRecoilValue(contextMenuIsOpenState);
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

  if (selectedIds.length === 0 || !contextMenuIsOpen) {
    return null;
  }

  const width = contextMenuEntries.some(
    (contextMenuEntry) => contextMenuEntry.label === 'Remove from favorites',
  )
    ? 200
    : undefined;

  return (
    <StyledContainerContextMenu
      className="context-menu"
      ref={wrapperRef}
      position={contextMenuPosition}
    >
      <StyledDropdownMenu data-select-disable width={width}>
        <DropdownMenuItemsContainer>
          {contextMenuEntries.map((item) => (
            <ContextMenuItem
              Icon={item.Icon}
              label={item.label}
              accent={item.accent}
              onClick={item.onClick}
              key={item.label}
            />
          ))}
        </DropdownMenuItemsContainer>
      </StyledDropdownMenu>
    </StyledContainerContextMenu>
  );
};
