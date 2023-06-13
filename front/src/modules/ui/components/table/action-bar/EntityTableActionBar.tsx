import React, { useEffect } from 'react';
import styled from '@emotion/styled';
import { useRecoilValue, useSetRecoilState } from 'recoil';

import { contextMenuPositionState } from '@/ui/tables/states/contextMenuPositionState';
import { selectedRowIdsState } from '@/ui/tables/states/selectedRowIdsState';
import { PositionType } from '@/ui/types/PositionType';

type OwnProps = {
  children: React.ReactNode | React.ReactNode[];
};

type StyledContainerProps = {
  position: PositionType;
};

const StyledContainer = styled.div<StyledContainerProps>`
  align-items: center;
  background: ${(props) => props.theme.secondaryBackground};
  border: 1px solid ${(props) => props.theme.primaryBorder};
  border-radius: 8px;
  bottom: ${(props) => (props.position.x ? 'auto' : '38px')};
  display: flex;
  height: 48px;

  left: ${(props) => (props.position.x ? `${props.position.x}px` : '50%')};
  padding-left: ${(props) => props.theme.spacing(2)};
  padding-right: ${(props) => props.theme.spacing(2)};
  position: ${(props) => (props.position.x ? 'fixed' : 'absolute')};
  top: ${(props) => (props.position.y ? `${props.position.y}px` : 'auto')};

  transform: translateX(-50%);
  z-index: 1;
`;

export function EntityTableActionBar({ children }: OwnProps) {
  const selectedRowIds = useRecoilValue(selectedRowIdsState);
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

  if (selectedRowIds.length === 0) {
    return null;
  }

  return (
    <StyledContainer className="action-bar" position={position}>
      {children}
    </StyledContainer>
  );
}
