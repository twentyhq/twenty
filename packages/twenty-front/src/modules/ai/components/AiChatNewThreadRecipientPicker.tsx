import { useLingui } from '@lingui/react/macro';
import { useState } from 'react';
import { isNonEmptyArray } from 'twenty-shared/utils';
import { Dropdown } from 'twenty-ui/components/navigation';
import { Avatar } from 'twenty-ui/primitives/data-display';
import { normalizeSearchText } from 'twenty-ui/utilities';

import { InboxChannelIcon } from '@/ai/components/AgentChatChannelIcon';
import { AiChatAssistantAvatar } from '@/ai/components/AiChatAssistantAvatar';
import { useAiChatAssistantProfile } from '@/ai/hooks/useAiChatAssistantProfile';
import { inboxNewThreadChannelIdState } from '@/ai/states/agentChatNewThreadChannelIdState';
import { aiChatNewThreadRecipientsFamilyState } from '@/ai/states/agentChatNewThreadRecipientsFamilyState';
import { aiChatIsSendingMessageFamilyState } from '@/ai/states/agentChatIsSendingMessageFamilyState';
import { newAiChatThreadIdState } from '@/ai/states/newAiChatThreadIdState';
import { inboxAccessibleChannelsSelector } from '@/ai/states/selectors/agentChatAccessibleChannelsSelector';
import { getToggledRecipientWorkspaceMemberIds } from '@/ai/utils/getToggledRecipientWorkspaceMemberIds';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { currentWorkspaceMembersState } from '@/auth/states/currentWorkspaceMembersState';
import { useAtomFamilyState } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyState';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { getWorkspaceMemberNameOrEmail } from '@/workspace-member/utils/getWorkspaceMemberNameOrEmail';
import { filterBySearchQuery } from '~/utils/filterBySearchQuery';
import { getAbsoluteImageUrl } from '~/utils/image/getAbsoluteImageUrl';

export const AiChatNewThreadRecipientPicker = () => {
  const { t } = useLingui();
  const { displayName: assistantName } = useAiChatAssistantProfile();
  const [search, setSearch] = useState('');
  const trimmedSearch = search.trim();
  const newAiChatThreadId = useAtomStateValue(newAiChatThreadIdState);
  const aiChatIsSendingMessage = useAtomFamilyStateValue(
    aiChatIsSendingMessageFamilyState,
    { threadId: newAiChatThreadId },
  );
  const [recipients, setRecipients] = useAtomFamilyState(
    aiChatNewThreadRecipientsFamilyState,
    newAiChatThreadId,
  );
  const [inboxNewThreadChannelId, setInboxNewThreadChannelId] = useAtomState(
    inboxNewThreadChannelIdState,
  );
  const currentWorkspaceMember = useAtomStateValue(currentWorkspaceMemberState);
  const currentWorkspaceMembers = useAtomStateValue(
    currentWorkspaceMembersState,
  );
  const inboxAccessibleChannels = useAtomStateValue(
    inboxAccessibleChannelsSelector,
  );
  const shouldShowAssistant = normalizeSearchText(assistantName).includes(
    normalizeSearchText(trimmedSearch),
  );
  const matchingWorkspaceMembers = filterBySearchQuery({
    items: currentWorkspaceMembers.filter(
      ({ id }) => id !== currentWorkspaceMember?.id,
    ),
    searchQuery: trimmedSearch,
    getSearchableValues: (workspaceMember) => [
      getWorkspaceMemberNameOrEmail(workspaceMember),
      workspaceMember.userEmail,
    ],
  });
  const matchingChannels = filterBySearchQuery({
    items: inboxAccessibleChannels,
    searchQuery: trimmedSearch,
    getSearchableValues: ({ name }) => [name],
  });
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
        disabled={aiChatIsSendingMessage}
      />
      <Dropdown.Separator />
      <Dropdown.Section scrollable>
        {shouldShowAssistant && (
          <Dropdown.OptionItem
            selected={recipients.isAssistantParticipant}
            disabled={aiChatIsSendingMessage}
            startIcon={<AiChatAssistantAvatar />}
            onSelect={() =>
              setRecipients((current) => ({
                ...current,
                isAssistantParticipant: !current.isAssistantParticipant,
              }))
            }
          >
            {assistantName}
          </Dropdown.OptionItem>
        )}
        {matchingWorkspaceMembers.map((workspaceMember) => {
          const label = getWorkspaceMemberNameOrEmail(workspaceMember);

          return (
            <Dropdown.OptionItem
              key={workspaceMember.id}
              disabled={aiChatIsSendingMessage}
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
            disabled={aiChatIsSendingMessage}
            indicator="check"
            selected={channel.id === inboxNewThreadChannelId}
            startIcon={<InboxChannelIcon channel={channel} />}
            description={t`Channel`}
            onSelect={() =>
              setInboxNewThreadChannelId(
                channel.id === inboxNewThreadChannelId ? null : channel.id,
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
