import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { useState } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { IconCheck, IconUserOff } from 'twenty-ui/icon';
import { Avatar } from 'twenty-ui/primitives/data-display';
import { themeCssVariables, useTheme } from 'twenty-ui/theme';

import { useAssignAgentChatThreads } from '@/ai/hooks/useAssignAgentChatThreads';
import { agentChatThreadsSharedAssigneeIdFamilySelector } from '@/ai/states/selectors/agentChatThreadsSharedAssigneeIdFamilySelector';
import { currentWorkspaceMembersState } from '@/auth/states/currentWorkspaceMembersState';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { CommandMenuItem } from '@/command-menu/components/CommandMenuItem';
import { SidePanelList } from '@/side-panel/components/SidePanelList';
import { useSidePanelMenu } from '@/side-panel/hooks/useSidePanelMenu';
import { assignAiChatThreadIdsComponentState } from '@/side-panel/pages/assign-ai-chat/states/assignAiChatThreadIdsComponentState';
import { getAssignAiChatMemberOptions } from '@/side-panel/pages/assign-ai-chat/utils/getAssignAiChatMemberOptions';
import { DropdownMenuSearchInput } from '@/ui/layout/dropdown/components/DropdownMenuSearchInput';
import { SelectableListItem } from '@/ui/layout/selectable-list/components/SelectableListItem';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useAtomFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilySelectorValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { getAbsoluteImageUrl } from '~/utils/image/getAbsoluteImageUrl';

const UNASSIGN_ITEM_ID = 'unassign';

const StyledSearchContainer = styled.div`
  border-bottom: 1px solid ${themeCssVariables.border.color.light};
  padding: 0 ${themeCssVariables.spacing[2]};
`;

export const SidePanelAssignAiChatPage = () => {
  const { t } = useLingui();
  const theme = useTheme();
  const assignAiChatThreadIds = useAtomComponentStateValue(
    assignAiChatThreadIdsComponentState,
  );
  const currentWorkspaceMembers = useAtomStateValue(
    currentWorkspaceMembersState,
  );
  const currentWorkspaceMember = useAtomStateValue(currentWorkspaceMemberState);
  const { sharedAssigneeId, hasAssignee } = useAtomFamilySelectorValue(
    agentChatThreadsSharedAssigneeIdFamilySelector,
    { threadIds: assignAiChatThreadIds },
  );
  const { assignAgentChatThreads } = useAssignAgentChatThreads();
  const { closeSidePanelMenu } = useSidePanelMenu();
  const [search, setSearch] = useState('');

  if (assignAiChatThreadIds.length === 0) {
    return null;
  }

  const members = getAssignAiChatMemberOptions({
    workspaceMembers: currentWorkspaceMembers,
    currentWorkspaceMemberId: currentWorkspaceMember?.id,
    search,
  });

  const isUnassignShown = hasAssignee && !isNonEmptyString(search.trim());

  const handleAssign = (assigneeWorkspaceMemberId: string | null) => {
    void closeSidePanelMenu();
    void assignAgentChatThreads({
      threadIds: assignAiChatThreadIds,
      assigneeWorkspaceMemberId,
    });
  };

  return (
    <>
      <StyledSearchContainer>
        <DropdownMenuSearchInput
          value={search}
          placeholder={t`Search members`}
          onChange={(event) => setSearch(event.target.value)}
        />
      </StyledSearchContainer>
      <SidePanelList
        selectableItemIds={[
          ...(isUnassignShown ? [UNASSIGN_ITEM_ID] : []),
          ...members.map(({ workspaceMember }) => workspaceMember.id),
        ]}
        noResults={members.length === 0}
        noResultsText={t`No members match your search`}
      >
        {isUnassignShown && (
          <SelectableListItem
            itemId={UNASSIGN_ITEM_ID}
            onEnter={() => handleAssign(null)}
          >
            <CommandMenuItem
              id={UNASSIGN_ITEM_ID}
              Icon={IconUserOff}
              label={t`No assignee`}
              onClick={() => handleAssign(null)}
            />
          </SelectableListItem>
        )}
        {members.map(({ workspaceMember, label }) => (
          <SelectableListItem
            key={workspaceMember.id}
            itemId={workspaceMember.id}
            onEnter={() => handleAssign(workspaceMember.id)}
          >
            <CommandMenuItem
              id={workspaceMember.id}
              label={label}
              description={
                workspaceMember.id === currentWorkspaceMember?.id
                  ? t`You`
                  : undefined
              }
              onClick={() => handleAssign(workspaceMember.id)}
              LeftComponent={
                <Avatar
                  src={getAbsoluteImageUrl(workspaceMember.avatarUrl)}
                  colorSeed={workspaceMember.id}
                  name={label}
                  shape="circle"
                />
              }
              RightComponent={
                isDefined(sharedAssigneeId) &&
                sharedAssigneeId === workspaceMember.id ? (
                  <IconCheck size={theme.icon.size.md} />
                ) : undefined
              }
            />
          </SelectableListItem>
        ))}
      </SidePanelList>
    </>
  );
};
