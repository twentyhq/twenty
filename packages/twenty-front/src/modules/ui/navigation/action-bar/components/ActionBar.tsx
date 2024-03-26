import React, { useRef } from 'react';
import styled from '@emotion/styled';
import { useRecoilValue } from 'recoil';

import { actionBarEntriesState } from '@/ui/navigation/action-bar/states/actionBarEntriesState';
import { contextMenuIsOpenState } from '@/ui/navigation/context-menu/states/contextMenuIsOpenState';

import { ActionBarItem } from './ActionBarItem';

type ActionBarProps = {
  selectedIds?: string[];
};

const StyledContainerActionBar = styled.div`
  align-items: center;
  background: ${({ theme }) => theme.background.secondary};
  border: 1px solid ${({ theme }) => theme.border.color.medium};
  border-radius: ${({ theme }) => theme.border.radius.md};
  box-shadow: ${({ theme }) => theme.boxShadow.strong};
  display: flex;

  padding: ${({ theme }) => theme.spacing(2)};
  max-width: fit-content;
  margin-left: auto;
  margin-right: auto;
  margin-bottom: ${({ theme }) => theme.spacing(7)};
`;

const StyledLabel = styled.div`
  color: ${({ theme }) => theme.font.color.tertiary};
  font-size: ${({ theme }) => theme.font.size.md};
  font-weight: ${({ theme }) => theme.font.weight.medium};
  padding-left: ${({ theme }) => theme.spacing(2)};
  padding-right: ${({ theme }) => theme.spacing(2)};
`;

export const ActionBar = ({ selectedIds }: ActionBarProps) => {
  const contextMenuIsOpen = useRecoilValue(contextMenuIsOpenState);
  const actionBarEntries = useRecoilValue(actionBarEntriesState);
  const wrapperRef = useRef<HTMLDivElement>(null);

  if (contextMenuIsOpen) {
    return null;
  }

  return (
    <StyledContainerActionBar
      data-select-disable
      className="action-bar"
      ref={wrapperRef}
    >
      {selectedIds && <StyledLabel>{selectedIds.length} selected:</StyledLabel>}
      {actionBarEntries.map((item, index) => (
        <ActionBarItem key={index} item={item} />
      ))}
    </StyledContainerActionBar>
  );
};
