import { useState } from 'react';
import { normalizeSearchText } from 'twenty-ui/utilities';

import { AI_CHAT_ASSISTANT_RECIPIENT_SUGGESTION_ID } from '@/ai-chat/composer/constants/AiChatAssistantRecipientSuggestionId';
import { AI_CHAT_NEW_THREAD_RECIPIENT_SUGGESTIONS_PAGE_SIZE } from '@/ai-chat/composer/constants/AiChatNewThreadRecipientSuggestionsPageSize';
import { useAiChatAssistantProfile } from '@/ai-chat/hooks/useAiChatAssistantProfile';
import { aiChatNewThreadChannelIdState } from '@/ai-chat/composer/states/aiChatNewThreadChannelIdState';
import { aiChatNewThreadRecipientsFamilyState } from '@/ai-chat/states/aiChatNewThreadRecipientsFamilyState';
import { newAiChatThreadIdState } from '@/ai-chat/states/newAiChatThreadIdState';
import { aiChatAccessibleChannelsSelector } from '@/ai-chat/threads/states/selectors/aiChatAccessibleChannelsSelector';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { currentWorkspaceMembersState } from '@/auth/states/currentWorkspaceMembersState';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { getWorkspaceMemberNameOrEmail } from '@/workspace-member/utils/getWorkspaceMemberNameOrEmail';
import { filterBySearchQuery } from '~/utils/filterBySearchQuery';

type UseAiChatNewThreadRecipientSuggestionsParams = {
  search: string;
};

export const useAiChatNewThreadRecipientSuggestions = ({
  search,
}: UseAiChatNewThreadRecipientSuggestionsParams) => {
  const { displayName: assistantName } = useAiChatAssistantProfile();
  const newAiChatThreadId = useAtomStateValue(newAiChatThreadIdState);
  const aiChatNewThreadRecipients = useAtomFamilyStateValue(
    aiChatNewThreadRecipientsFamilyState,
    newAiChatThreadId,
  );
  const aiChatNewThreadChannelId = useAtomStateValue(
    aiChatNewThreadChannelIdState,
  );
  const currentWorkspaceMember = useAtomStateValue(currentWorkspaceMemberState);
  const currentWorkspaceMembers = useAtomStateValue(
    currentWorkspaceMembersState,
  );
  const aiChatAccessibleChannels = useAtomStateValue(
    aiChatAccessibleChannelsSelector,
  );
  const [visibleSuggestionCount, setVisibleSuggestionCount] = useState(
    AI_CHAT_NEW_THREAD_RECIPIENT_SUGGESTIONS_PAGE_SIZE,
  );

  const searchQuery = search.trim();
  const isAssistantSuggested =
    !aiChatNewThreadRecipients.isAssistantParticipant &&
    normalizeSearchText(assistantName).includes(
      normalizeSearchText(searchQuery),
    );
  const matchingWorkspaceMembers = filterBySearchQuery({
    items: currentWorkspaceMembers.filter(
      ({ id }) =>
        id !== currentWorkspaceMember?.id &&
        !aiChatNewThreadRecipients.recipientWorkspaceMemberIds.includes(id),
    ),
    searchQuery,
    getSearchableValues: (workspaceMember) => [
      getWorkspaceMemberNameOrEmail(workspaceMember),
      workspaceMember.userEmail,
    ],
  });
  const matchingChannels = filterBySearchQuery({
    items: aiChatAccessibleChannels.filter(
      ({ id }) => id !== aiChatNewThreadChannelId,
    ),
    searchQuery,
    getSearchableValues: ({ name }) => [name],
  });
  const assistantSuggestionCount = isAssistantSuggested ? 1 : 0;
  const suggestedWorkspaceMembers = matchingWorkspaceMembers.slice(
    0,
    visibleSuggestionCount - assistantSuggestionCount,
  );
  const suggestedChannels = matchingChannels.slice(
    0,
    Math.max(
      0,
      visibleSuggestionCount -
        assistantSuggestionCount -
        matchingWorkspaceMembers.length,
    ),
  );
  const matchingSuggestionCount =
    assistantSuggestionCount +
    matchingWorkspaceMembers.length +
    matchingChannels.length;

  return {
    isAssistantSuggested,
    suggestedWorkspaceMembers,
    suggestedChannels,
    suggestionIds: [
      ...(isAssistantSuggested
        ? [AI_CHAT_ASSISTANT_RECIPIENT_SUGGESTION_ID]
        : []),
      ...suggestedWorkspaceMembers.map(({ id }) => id),
      ...suggestedChannels.map(({ id }) => id),
    ],
    hasMoreSuggestions: visibleSuggestionCount < matchingSuggestionCount,
    showMoreSuggestions: () =>
      setVisibleSuggestionCount(
        (currentCount) =>
          currentCount + AI_CHAT_NEW_THREAD_RECIPIENT_SUGGESTIONS_PAGE_SIZE,
      ),
    resetVisibleSuggestionCount: () =>
      setVisibleSuggestionCount(
        AI_CHAT_NEW_THREAD_RECIPIENT_SUGGESTIONS_PAGE_SIZE,
      ),
  };
};
