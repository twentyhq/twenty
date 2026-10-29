import { agentChatDisplayedThreadState } from '@/ai/states/agentChatDisplayedThreadState';
import { agentChatThreadListState } from '@/ai/states/agentChatThreadListState';
import { currentAiChatThreadState } from '@/ai/states/currentAiChatThreadState';
import { newAiChatThreadIdState } from '@/ai/states/newAiChatThreadIdState';
import { agentChatNewThreadChannelIdState } from '@/ai/states/agentChatNewThreadChannelIdState';
import { agentChatNewThreadRecipientsFamilyState } from '@/ai/states/agentChatNewThreadRecipientsFamilyState';
import { agentChatIsSendingMessageFamilyState } from '@/ai/states/agentChatIsSendingMessageFamilyState';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { currentWorkspaceMembersState } from '@/auth/states/currentWorkspaceMembersState';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { aiModelTiersState } from '@/client-config/states/aiModelTiersState';
import { aiModelsState } from '@/client-config/states/aiModelsState';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import { AiModelTier, FeatureFlagKey } from '~/generated-metadata/graphql';
import {
  mockCurrentWorkspace,
  mockedWorkspaceMemberData,
} from '~/testing/mock-data/users';

const NEW_CHAT_THREAD_ID = '20202020-7c1e-4a0f-9d2b-3f4e5a6b7c8d';
const MODEL_ID = 'new-chat-story-model';

export const initializeNewAiChatStory = ({
  isInboxEnabled,
}: {
  isInboxEnabled: boolean;
}) => {
  jotaiStore.set(newAiChatThreadIdState.atom, NEW_CHAT_THREAD_ID);
  jotaiStore.set(agentChatNewThreadChannelIdState.atom, null);
  jotaiStore.set(
    agentChatIsSendingMessageFamilyState.atomFamily({
      threadId: NEW_CHAT_THREAD_ID,
    }),
    false,
  );
  jotaiStore.set(
    agentChatNewThreadRecipientsFamilyState.atomFamily(NEW_CHAT_THREAD_ID),
    {
      isAssistantParticipant: true,
      recipientWorkspaceMemberIds: [],
    },
  );
  jotaiStore.set(currentWorkspaceMemberState.atom, mockedWorkspaceMemberData);
  jotaiStore.set(currentWorkspaceMembersState.atom, [
    mockedWorkspaceMemberData,
    {
      ...mockedWorkspaceMemberData,
      id: '20202020-7c1e-4a0f-9d2b-3f4e5a6b7c8e',
      name: { firstName: 'Jane', lastName: 'Doe' },
      userEmail: 'jane@example.com',
    },
  ]);
  jotaiStore.set(currentAiChatThreadState.atom, NEW_CHAT_THREAD_ID);
  jotaiStore.set(agentChatDisplayedThreadState.atom, NEW_CHAT_THREAD_ID);
  jotaiStore.set(agentChatThreadListState.atom, {
    threadIds: [],
    hasNextPage: false,
    endCursor: null,
  });
  jotaiStore.set(currentWorkspaceState.atom, {
    ...mockCurrentWorkspace,
    featureFlags: [
      {
        key: FeatureFlagKey.IS_AI_CHAT_INBOX_ENABLED,
        value: isInboxEnabled,
      },
    ],
  });
  jotaiStore.set(aiModelsState.atom, [
    { modelId: MODEL_ID, label: 'Story model' },
  ]);
  jotaiStore.set(aiModelTiersState.atom, [
    { tier: AiModelTier.fast, modelId: MODEL_ID },
  ]);
};
