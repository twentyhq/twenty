import React, { useRef } from 'react';
import styled from '@emotion/styled';
import { useRecoilValue } from 'recoil';

import { actionBarEntriesState } from '@/ui/action-bar/states/actionBarEntriesState';
import { contextMenuIsOpenState } from '@/ui/context-menu/states/contextMenuIsOpenState';

import { actionBarOpenState } from '../states/actionBarIsOpenState';

type OwnProps = {
  selectedIds: string[];
};

const StyledContainerActionBar = styled.div`
  align-items: center;
  background: ${({ theme }) => theme.background.secondary};
  border: 1px solid ${({ theme }) => theme.border.color.medium};
  border-radius: ${({ theme }) => theme.border.radius.md};
  bottom: 38px;
  box-shadow: ${({ theme }) => theme.boxShadow.strong};
  display: flex;
  height: 48px;

  left: 50%;
  padding-left: ${({ theme }) => theme.spacing(2)};
  padding-right: ${({ theme }) => theme.spacing(2)};
  position: absolute;
  top: auto;

  transform: translateX(-50%);
  z-index: 1;
`;

export function ActionBar({ selectedIds }: OwnProps) {
  const actionBarOpen = useRecoilValue(actionBarOpenState);
  const contextMenuOpen = useRecoilValue(contextMenuIsOpenState);
  const actionBarEntries = useRecoilValue(actionBarEntriesState);
  const wrapperRef = useRef(null);

  if (selectedIds.length === 0 || !actionBarOpen || contextMenuOpen) {
    return null;
  }
  return (
    <StyledContainerActionBar className="action-bar" ref={wrapperRef}>
      {actionBarEntries}
    </StyledContainerActionBar>
  );
}
