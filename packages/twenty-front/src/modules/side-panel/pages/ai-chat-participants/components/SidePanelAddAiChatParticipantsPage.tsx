import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { useState } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { Button } from 'twenty-ui/primitives/input';
import { themeCssVariables } from 'twenty-ui/theme';

import { useAddParticipantsToAiChatThread } from '@/ai-chat/threads/hooks/useAddParticipantsToAiChatThread';
import { useAiChatThreadMembers } from '@/ai-chat/threads/hooks/useAiChatThreadMembers';
import { aiChatThreadRecordFamilySelector } from '@/ai-chat/threads/states/selectors/aiChatThreadRecordFamilySelector';
import { currentWorkspaceMembersState } from '@/auth/states/currentWorkspaceMembersState';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { SidePanelGroup } from '@/side-panel/components/SidePanelGroup';
import { SidePanelList } from '@/side-panel/components/SidePanelList';
import { SIDE_PANEL_FOCUS_ID } from '@/side-panel/constants/SidePanelFocusId';
import { useSidePanelHistory } from '@/side-panel/hooks/useSidePanelHistory';
import { SidePanelAddAiChatParticipantsMemberItem } from '@/side-panel/pages/ai-chat-participants/components/SidePanelAddAiChatParticipantsMemberItem';
import { SidePanelAiChatParticipantsPageLayout } from '@/side-panel/pages/ai-chat-participants/components/SidePanelAiChatParticipantsPageLayout';
import { getAssignAiChatMemberOptions } from '@/side-panel/pages/assign-ai-chat/utils/getAssignAiChatMemberOptions';
import { aiChatParticipantsThreadIdComponentState } from '@/side-panel/states/aiChatParticipantsThreadIdComponentState';
import { DropdownMenuSearchInput } from '@/ui/layout/dropdown/components/DropdownMenuSearchInput';
import { SelectableListItem } from '@/ui/layout/selectable-list/components/SelectableListItem';
import { useHotkeysOnFocusedElement } from '@/ui/utilities/hotkey/hooks/useHotkeysOnFocusedElement';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useAtomFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilySelectorValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

const StyledSearchContainer = styled.div`
  border-bottom: 1px solid ${themeCssVariables.border.color.light};
  padding: 0 ${themeCssVariables.spacing[2]};
`;

export const SidePanelAddAiChatParticipantsPage = () => {
  const { t } = useLingui();
  const aiChatParticipantsThreadId = useAtomComponentStateValue(
    aiChatParticipantsThreadIdComponentState,
  );
  const [search, setSearch] = useState('');
  const [checkedWorkspaceMemberIds, setCheckedWorkspaceMemberIds] = useState<
    string[]
  >([]);
  const thread = useAtomFamilySelectorValue(
    aiChatThreadRecordFamilySelector,
    aiChatParticipantsThreadId ?? '',
  );
  const threadMembers = useAiChatThreadMembers(thread);
  const currentWorkspaceMembers = useAtomStateValue(
    currentWorkspaceMembersState,
  );
  const currentWorkspaceMember = useAtomStateValue(currentWorkspaceMemberState);
  const candidates = getAssignAiChatMemberOptions({
    workspaceMembers: currentWorkspaceMembers,
    currentWorkspaceMemberId: currentWorkspaceMember?.id,
    excludedWorkspaceMemberIds: [
      currentWorkspaceMember?.id,
      ...threadMembers.map(({ id }) => id),
    ].filter(isDefined),
    search,
  });
  const { addParticipantsToAiChatThread, isAdding } =
    useAddParticipantsToAiChatThread();
  const { goBackFromSidePanel } = useSidePanelHistory();

  const checkedCount = checkedWorkspaceMemberIds.length;
  const canAdd = checkedCount > 0 && !isAdding;

  const handleAdd = async () => {
    if (!isDefined(aiChatParticipantsThreadId) || !canAdd) {
      return;
    }

    const hasAdded = await addParticipantsToAiChatThread({
      threadId: aiChatParticipantsThreadId,
      workspaceMemberIds: checkedWorkspaceMemberIds,
    });

    if (hasAdded) {
      goBackFromSidePanel();
    }
  };

  useHotkeysOnFocusedElement({
    keys: ['ctrl+Enter,meta+Enter'],
    callback: () => void handleAdd(),
    focusId: SIDE_PANEL_FOCUS_ID,
    dependencies: [handleAdd],
  });

  if (!isDefined(aiChatParticipantsThreadId)) {
    return null;
  }

  const toggleWorkspaceMember = (workspaceMemberId: string) =>
    setCheckedWorkspaceMemberIds((workspaceMemberIds) =>
      workspaceMemberIds.includes(workspaceMemberId)
        ? workspaceMemberIds.filter((id) => id !== workspaceMemberId)
        : [...workspaceMemberIds, workspaceMemberId],
    );

  return (
    <SidePanelAiChatParticipantsPageLayout
      header={
        <StyledSearchContainer>
          <DropdownMenuSearchInput
            value={search}
            placeholder={t`Search members`}
            onChange={(event) => setSearch(event.target.value)}
          />
        </StyledSearchContainer>
      }
      footerActions={[
        <Button
          key="add"
          size="sm"
          variant="solid"
          color="accent"
          shortcut={['Mod', 'Enter']}
          loading={isAdding}
          disabled={!canAdd}
          onClick={() => void handleAdd()}
        >
          {checkedCount === 0 ? t`Add` : t`Add ${checkedCount}`}
        </Button>,
      ]}
    >
      <SidePanelList
        selectableItemIds={candidates.map(
          ({ workspaceMember }) => workspaceMember.id,
        )}
        noResults={candidates.length === 0}
        noResultsText={t`No members to add`}
      >
        <SidePanelGroup heading={t`Workspace members`}>
          {candidates.map(({ workspaceMember, label }) => (
            <SelectableListItem
              key={workspaceMember.id}
              itemId={workspaceMember.id}
              onEnter={() => toggleWorkspaceMember(workspaceMember.id)}
            >
              <SidePanelAddAiChatParticipantsMemberItem
                workspaceMember={workspaceMember}
                label={label}
                isChecked={checkedWorkspaceMemberIds.includes(
                  workspaceMember.id,
                )}
                onToggle={() => toggleWorkspaceMember(workspaceMember.id)}
              />
            </SelectableListItem>
          ))}
        </SidePanelGroup>
      </SidePanelList>
    </SidePanelAiChatParticipantsPageLayout>
  );
};
