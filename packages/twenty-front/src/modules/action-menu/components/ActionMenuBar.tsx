import styled from '@emotion/styled';

import { ActionMenuBarEntry } from '@/action-menu/components/ActionMenuBarEntry';
import { actionMenuEntriesComponentState } from '@/action-menu/states/actionMenuEntriesComponentState';
import { ActionMenuComponentInstanceContext } from '@/action-menu/states/contexts/ActionMenuComponentInstanceContext';
import { ActionBarHotkeyScope } from '@/action-menu/types/ActionBarHotKeyScope';
import { contextStoreTargetedRecordIdsState } from '@/context-store/states/contextStoreTargetedRecordIdsState';
import { BottomBar } from '@/ui/layout/bottom-bar/components/BottomBar';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { useRecoilValue } from 'recoil';

const StyledLabel = styled.div`
  color: ${({ theme }) => theme.font.color.tertiary};
  font-size: ${({ theme }) => theme.font.size.md};
  font-weight: ${({ theme }) => theme.font.weight.medium};
  padding-left: ${({ theme }) => theme.spacing(2)};
  padding-right: ${({ theme }) => theme.spacing(2)};
`;

export const ActionMenuBar = () => {
  const contextStoreTargetedRecordIds = useRecoilValue(
    contextStoreTargetedRecordIdsState,
  );

  const actionMenuId = useAvailableComponentInstanceIdOrThrow(
    ActionMenuComponentInstanceContext,
  );

  const actionMenuEntries = useRecoilComponentValueV2(
    actionMenuEntriesComponentState,
  );

  return (
    <BottomBar
      bottomBarId={`action-bar-${actionMenuId}`}
      bottomBarHotkeyScopeFromParent={{
        scope: ActionBarHotkeyScope.ActionBar,
      }}
    >
      <StyledLabel>
        {contextStoreTargetedRecordIds.length} selected:
      </StyledLabel>
      {actionMenuEntries.map((entry, index) => (
        <ActionMenuBarEntry key={index} entry={entry} />
      ))}
    </BottomBar>
  );
};
