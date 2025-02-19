import { RecordIndexActionMenuBarAllActionsButton } from '@/action-menu/components/RecordIndexActionMenuBarAllActionsButton';
import { RecordIndexActionMenuBarEntry } from '@/action-menu/components/RecordIndexActionMenuBarEntry';
import { actionMenuEntriesComponentSelector } from '@/action-menu/states/actionMenuEntriesComponentSelector';
import { ActionMenuComponentInstanceContext } from '@/action-menu/states/contexts/ActionMenuComponentInstanceContext';
import { ActionBarHotkeyScope } from '@/action-menu/types/ActionBarHotKeyScope';
import { getActionBarIdFromActionMenuId } from '@/action-menu/utils/getActionBarIdFromActionMenuId';
import { contextStoreNumberOfSelectedRecordsComponentState } from '@/context-store/states/contextStoreNumberOfSelectedRecordsComponentState';
import { BottomBar } from '@/ui/layout/bottom-bar/components/BottomBar';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import styled from '@emotion/styled';

const StyledLabel = styled.div`
  color: ${({ theme }) => theme.font.color.tertiary};
  font-size: ${({ theme }) => theme.font.size.md};
  font-weight: ${({ theme }) => theme.font.weight.medium};
  padding-left: ${({ theme }) => theme.spacing(2)};
  padding-right: ${({ theme }) => theme.spacing(2)};
`;

export const RecordIndexActionMenuBar = () => {
  const contextStoreNumberOfSelectedRecords = useRecoilComponentValueV2(
    contextStoreNumberOfSelectedRecordsComponentState,
  );

  const actionMenuId = useAvailableComponentInstanceIdOrThrow(
    ActionMenuComponentInstanceContext,
  );

  const actionMenuEntries = useRecoilComponentValueV2(
    actionMenuEntriesComponentSelector,
  );

  const pinnedEntries = actionMenuEntries.filter((entry) => entry.isPinned);
  if (contextStoreNumberOfSelectedRecords === 0) {
    return null;
  }

  return (
    <BottomBar
      bottomBarId={getActionBarIdFromActionMenuId(actionMenuId)}
      bottomBarHotkeyScopeFromParent={{ scope: ActionBarHotkeyScope.ActionBar }}
    >
      <StyledLabel>{contextStoreNumberOfSelectedRecords} selected:</StyledLabel>
      {pinnedEntries.map((entry, index) => (
        <RecordIndexActionMenuBarEntry key={index} entry={entry} />
      ))}
      <RecordIndexActionMenuBarAllActionsButton />
    </BottomBar>
  );
};
