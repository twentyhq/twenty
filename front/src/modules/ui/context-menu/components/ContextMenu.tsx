import React, { useEffect } from 'react';
import styled from '@emotion/styled';
import { useRecoilValue, useSetRecoilState } from 'recoil';

import { contextMenuPositionState } from '@/ui/table/states/contextMenuPositionState';

import { PositionType } from '../types/PositionType';

type OwnProps = {
  children: React.ReactNode | React.ReactNode[];
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

export function ContextMenu({ children, selectedIds }: OwnProps) {
  const position = useRecoilValue(contextMenuPositionState);
  const setContextMenuPosition = useSetRecoilState(contextMenuPositionState);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (!(event.target as HTMLElement).closest('.action-bar')) {
        setContextMenuPosition({ x: null, y: null });
      }
    }

    document.addEventListener('mousedown', handleClickOutside);

    // Cleanup the event listener when the component unmounts
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [setContextMenuPosition]);

  if (selectedIds.length === 0 || (!position.x && !position.y)) {
    return null;
  }
  return (
    <StyledContainerContextMenu className="action-bar" position={position}>
      {children}
    </StyledContainerContextMenu>
  );
}
