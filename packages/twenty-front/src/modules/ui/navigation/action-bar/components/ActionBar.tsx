import { useEffect, useRef } from 'react';
import styled from '@emotion/styled';
import { useRecoilValue, useSetRecoilState } from 'recoil';

import { actionBarEntriesState } from '@/ui/navigation/action-bar/states/actionBarEntriesState';
import { contextMenuIsOpenState } from '@/ui/navigation/context-menu/states/contextMenuIsOpenState';
import SharedNavigationModal from '@/ui/navigation/shared/components/NavigationModal';

import { ActionBarItem } from './ActionBarItem';

type ActionBarProps = {
  selectedIds?: string[];
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

const StyledLabel = styled.div`
  color: ${({ theme }) => theme.font.color.tertiary};
  font-size: ${({ theme }) => theme.font.size.md};
  font-weight: ${({ theme }) => theme.font.weight.medium};
  padding-left: ${({ theme }) => theme.spacing(2)};
  padding-right: ${({ theme }) => theme.spacing(2)};
`;

export const ActionBar = ({ selectedIds = [] }: ActionBarProps) => {
  const setContextMenuOpenState = useSetRecoilState(contextMenuIsOpenState);

  useEffect(() => {
    if (selectedIds && selectedIds.length > 1) {
      setContextMenuOpenState(false);
    }
  }, [selectedIds, setContextMenuOpenState]);

  const contextMenuIsOpen = useRecoilValue(contextMenuIsOpenState);
  const actionBarEntries = useRecoilValue(actionBarEntriesState);
  const wrapperRef = useRef<HTMLDivElement>(null);

  if (contextMenuIsOpen) {
    return null;
  }

  return (
    <>
      <StyledContainerActionBar
        data-select-disable
        className="action-bar"
        ref={wrapperRef}
      >
        {selectedIds && (
          <StyledLabel>{selectedIds.length} selected:</StyledLabel>
        )}
        {actionBarEntries.map((item, index) => (
          <ActionBarItem key={index} item={item} />
        ))}
      </StyledContainerActionBar>
      <SharedNavigationModal
        actionBarEntries={actionBarEntries}
        customClassName="action-bar"
      />
    </>
  );
};
