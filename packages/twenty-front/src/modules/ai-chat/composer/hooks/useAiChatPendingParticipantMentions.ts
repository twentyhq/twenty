import { useAiChatInstanceOrThrow } from '@/ai-chat/hooks/useAiChatInstanceOrThrow';
import { useMemo } from 'react';

import { aiChatComposerDraftsState } from '@/ai-chat/states/composer/aiChatComposerDraftsState';
import { aiChatThreadRecordFamilySelector } from '@/ai-chat/threads/states/selectors/aiChatThreadRecordFamilySelector';
import { filterNewParticipantMentions } from '@/ai-chat/composer/utils/filterNewParticipantMentions';
import { getParticipantMentionsFromSerializedDocument } from '@/ai-chat/composer/utils/getParticipantMentionsFromSerializedDocument';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { useAtomFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilySelectorValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

export const useAiChatPendingParticipantMentions = () => {
  const { threadId } = useAiChatInstanceOrThrow();
  const serializedDraft =
    useAtomStateValue(aiChatComposerDraftsState)[threadId] ?? '';
  const thread = useAtomFamilySelectorValue(
    aiChatThreadRecordFamilySelector,
    threadId,
  );
  const currentWorkspaceMember = useAtomStateValue(currentWorkspaceMemberState);

  const participantMentions = useMemo(
    () => getParticipantMentionsFromSerializedDocument(serializedDraft),
    [serializedDraft],
  );

  return filterNewParticipantMentions({
    participantMentions,
    thread,
    currentWorkspaceMemberId: currentWorkspaceMember?.id,
  });
};
