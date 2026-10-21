import { agentChatDisplayedThreadState } from '@/ai/states/agentChatDisplayedThreadState';
import { agentChatThreadListState } from '@/ai/states/agentChatThreadListState';
import { currentAiChatThreadState } from '@/ai/states/currentAiChatThreadState';
import { newAiChatThreadIdState } from '@/ai/states/newAiChatThreadIdState';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { aiModelTiersState } from '@/client-config/states/aiModelTiersState';
import { aiModelsState } from '@/client-config/states/aiModelsState';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import { AiModelTier, FeatureFlagKey } from '~/generated-metadata/graphql';
import { mockCurrentWorkspace } from '~/testing/mock-data/users';

const NEW_CHAT_THREAD_ID = '20202020-7c1e-4a0f-9d2b-3f4e5a6b7c8d';
const MODEL_ID = 'new-chat-story-model';

export const initializeNewAiChatStory = ({
  isInboxEnabled,
}: {
  isInboxEnabled: boolean;
}) => {
  jotaiStore.set(newAiChatThreadIdState.atom, NEW_CHAT_THREAD_ID);
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
