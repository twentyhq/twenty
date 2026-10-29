import { useLingui } from '@lingui/react/macro';
import { useState } from 'react';
import { isNonEmptyArray } from 'twenty-shared/utils';
import { Dropdown } from 'twenty-ui/components/navigation';
import { Avatar } from 'twenty-ui/primitives/data-display';

import { AgentChatChannelIcon } from '@/ai/components/AgentChatChannelIcon';
import { AiChatAssistantAvatar } from '@/ai/components/AiChatAssistantAvatar';
import { AGENT_CHAT_ASSISTANT_NAME } from '@/ai/constants/AgentChatAssistantName';
import { agentChatNewThreadChannelIdState } from '@/ai/states/agentChatNewThreadChannelIdState';
import { agentChatNewThreadRecipientsFamilyState } from '@/ai/states/agentChatNewThreadRecipientsFamilyState';
import { agentChatIsSendingMessageFamilyState } from '@/ai/states/agentChatIsSendingMessageFamilyState';
import { newAiChatThreadIdState } from '@/ai/states/newAiChatThreadIdState';
import { agentChatAccessibleChannelsSelector } from '@/ai/states/selectors/agentChatAccessibleChannelsSelector';
import { getToggledRecipientWorkspaceMemberIds } from '@/ai/utils/getToggledRecipientWorkspaceMemberIds';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { currentWorkspaceMembersState } from '@/auth/states/currentWorkspaceMembersState';
import { useAtomFamilyState } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyState';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { getWorkspaceMemberNameOrEmail } from '@/workspace-member/utils/getWorkspaceMemberNameOrEmail';
import { getAbsoluteImageUrl } from '~/utils/image/getAbsoluteImageUrl';

export const AiChatNewThreadRecipientPicker = () => {
  const { t } = useLingui();
  const [search, setSearch] = useState('');
  const normalizedSearch = search.trim().toLowerCase();
  const newAiChatThreadId = useAtomStateValue(newAiChatThreadIdState);
  const agentChatIsSendingMessage = useAtomFamilyStateValue(
    agentChatIsSendingMessageFamilyState,
    { threadId: newAiChatThreadId },
  );
  const [recipients, setRecipients] = useAtomFamilyState(
    agentChatNewThreadRecipientsFamilyState,
    newAiChatThreadId,
  );
  const [agentChatNewThreadChannelId, setAgentChatNewThreadChannelId] =
    useAtomState(agentChatNewThreadChannelIdState);
  const currentWorkspaceMember = useAtomStateValue(currentWorkspaceMemberState);
  const currentWorkspaceMembers = useAtomStateValue(
    currentWorkspaceMembersState,
  );
  const agentChatAccessibleChannels = useAtomStateValue(
    agentChatAccessibleChannelsSelector,
  );
  const shouldShowAssistant =
    AGENT_CHAT_ASSISTANT_NAME.toLowerCase().includes(normalizedSearch);
  const matchingWorkspaceMembers = currentWorkspaceMembers.filter(
    (workspaceMember) =>
      workspaceMember.id !== currentWorkspaceMember?.id &&
      `${getWorkspaceMemberNameOrEmail(workspaceMember)} ${workspaceMember.userEmail}`
        .toLowerCase()
        .includes(normalizedSearch),
  );
  const matchingChannels = agentChatAccessibleChannels.filter(({ name }) =>
    name.toLowerCase().includes(normalizedSearch),
  );
  const hasMatches =
    shouldShowAssistant ||
    isNonEmptyArray(matchingWorkspaceMembers) ||
    isNonEmptyArray(matchingChannels);

  const toggleWorkspaceMember = (workspaceMemberId: string) => {
    setRecipients((current) => ({
      ...current,
      recipientWorkspaceMemberIds: getToggledRecipientWorkspaceMemberIds({
        recipientWorkspaceMemberIds: current.recipientWorkspaceMemberIds,
        workspaceMemberId,
      }),
    }));
  };

  return (
    <>
      <Dropdown.Search
        aria-label={t`Search recipients`}
        placeholder={t`Add people or a channel`}
        value={search}
        onValueChange={setSearch}
        disabled={agentChatIsSendingMessage}
      />
      <Dropdown.Separator />
      <Dropdown.Section scrollable>
        {shouldShowAssistant && (
          <Dropdown.OptionItem
            selected={recipients.isAssistantParticipant}
            disabled={agentChatIsSendingMessage}
            startIcon={<AiChatAssistantAvatar />}
            onSelect={() =>
              setRecipients((current) => ({
                ...current,
                isAssistantParticipant: !current.isAssistantParticipant,
              }))
            }
          >
            {AGENT_CHAT_ASSISTANT_NAME}
          </Dropdown.OptionItem>
        )}
        {matchingWorkspaceMembers.map((workspaceMember) => {
          const label = getWorkspaceMemberNameOrEmail(workspaceMember);

          return (
            <Dropdown.OptionItem
              key={workspaceMember.id}
              disabled={agentChatIsSendingMessage}
              selected={recipients.recipientWorkspaceMemberIds.includes(
                workspaceMember.id,
              )}
              startIcon={
                <Avatar
                  name={label}
                  colorSeed={workspaceMember.id}
                  src={getAbsoluteImageUrl(workspaceMember.avatarUrl)}
                  size="sm"
                  shape="circle"
                />
              }
              description={workspaceMember.userEmail}
              onSelect={() => toggleWorkspaceMember(workspaceMember.id)}
            >
              {label}
            </Dropdown.OptionItem>
          );
        })}
        {matchingChannels.map((channel) => (
          <Dropdown.OptionItem
            key={channel.id}
            disabled={agentChatIsSendingMessage}
            selected={channel.id === agentChatNewThreadChannelId}
            startIcon={<AgentChatChannelIcon channel={channel} />}
            description={t`Channel`}
            onSelect={() =>
              setAgentChatNewThreadChannelId(
                channel.id === agentChatNewThreadChannelId ? null : channel.id,
              )
            }
          >
            {channel.name}
          </Dropdown.OptionItem>
        ))}
        {!hasMatches && (
          <Dropdown.Empty>{t`No recipients found`}</Dropdown.Empty>
        )}
      </Dropdown.Section>
    </>
  );
};
