import styled from '@emotion/styled';

import { actionMenuEntriesState } from '@/action-menu/states/actionMenuEntriesState';
import { ActionBarHotkeyScope } from '@/action-menu/types/ActionBarHotKeyScope';
import { contextStoreTargetedRecordIdsState } from '@/context-store/states/contextStoreTargetedRecordIdsState';
import { BottomBar } from '@/ui/layout/bottom-bar/components/BottomBar';
import { useRecoilValue } from 'recoil';
import { ActionBarItem } from './ActionBarItem';

const StyledLabel = styled.div`
  color: ${({ theme }) => theme.font.color.tertiary};
  font-size: ${({ theme }) => theme.font.size.md};
  font-weight: ${({ theme }) => theme.font.weight.medium};
  padding-left: ${({ theme }) => theme.spacing(2)};
  padding-right: ${({ theme }) => theme.spacing(2)};
`;

type ActionBarProps = {
  actionBarId: string;
};

export const ActionBar = ({ actionBarId }: ActionBarProps) => {
  const contextStoreTargetedRecordIds = useRecoilValue(
    contextStoreTargetedRecordIdsState,
  );

  const actionMenuEntries = useRecoilValue(actionMenuEntriesState);

  return (
    <BottomBar
      bottomBarId={`action-bar-${actionBarId}`}
      bottomBarHotkeyScopeFromParent={{
        scope: ActionBarHotkeyScope.ActionBar,
      }}
    >
      <StyledLabel>
        {contextStoreTargetedRecordIds.length} selected:
      </StyledLabel>
      {actionMenuEntries.map((item, index) => (
        <ActionBarItem key={index} item={item} />
      ))}
    </BottomBar>
  );
};
