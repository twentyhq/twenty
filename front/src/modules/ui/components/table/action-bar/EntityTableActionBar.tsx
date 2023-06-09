import React, { useEffect } from 'react';
import styled from '@emotion/styled';
import { useRecoilValue, useSetRecoilState } from 'recoil';

import {
  contextMenuPositionState,
  PositionState,
} from '@/ui/tables/states/contextMenuPositionState';
import { selectedRowIdsState } from '@/ui/tables/states/selectedRowIdsState';

type OwnProps = {
  children: React.ReactNode | React.ReactNode[];
};

type StyledContainerProps = {
  position: PositionState;
};

const StyledContainer = styled.div<StyledContainerProps>`
  display: flex;
  position: ${(props) => (props.position.x ? 'fixed' : 'absolute')};
  z-index: 1;
  height: 48px;
  bottom: ${(props) => (props.position.x ? 'auto' : '38px')};
  left: ${(props) => (props.position.x ? `${props.position.x}px` : '50%')};
  top: ${(props) => (props.position.y ? `${props.position.y}px` : 'auto')};

  background: ${(props) => props.theme.secondaryBackground};
  align-items: center;
  padding-left: ${(props) => props.theme.spacing(2)};
  padding-right: ${(props) => props.theme.spacing(2)};
  transform: translateX(-50%);

  border-radius: 8px;
  border: 1px solid ${(props) => props.theme.primaryBorder};
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
