import { AI_CHAT_NEW_THREAD_DEFAULT_RECIPIENTS } from '@/ai/constants/AiChatNewThreadDefaultRecipients';
import { aiChatDisplayedThreadState } from '@/ai/states/aiChatDisplayedThreadState';
import { INBOX_RECENT_THREAD_LIST_SOURCE } from '@/inbox/constants/InboxRecentThreadListSource';
import { inboxThreadListFamilyState } from '@/inbox/states/inboxThreadListFamilyState';
import { getInboxThreadListSourceKey } from '@/inbox/utils/getInboxThreadListSourceKey';
import { currentAiChatThreadState } from '@/ai/states/currentAiChatThreadState';
import { newAiChatThreadIdState } from '@/ai/states/newAiChatThreadIdState';
import { inboxNewThreadChannelIdState } from '@/inbox/states/inboxNewThreadChannelIdState';
import { aiChatNewThreadRecipientsFamilyState } from '@/ai/states/aiChatNewThreadRecipientsFamilyState';
import { aiChatIsSendingMessageFamilyState } from '@/ai/states/aiChatIsSendingMessageFamilyState';
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
  jotaiStore.set(inboxNewThreadChannelIdState.atom, null);
  jotaiStore.set(
    aiChatIsSendingMessageFamilyState.atomFamily({
      threadId: NEW_CHAT_THREAD_ID,
    }),
    false,
  );
  jotaiStore.set(
    aiChatNewThreadRecipientsFamilyState.atomFamily(NEW_CHAT_THREAD_ID),
    AI_CHAT_NEW_THREAD_DEFAULT_RECIPIENTS,
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
  jotaiStore.set(aiChatDisplayedThreadState.atom, NEW_CHAT_THREAD_ID);
  jotaiStore.set(
    inboxThreadListFamilyState.atomFamily(
      getInboxThreadListSourceKey(INBOX_RECENT_THREAD_LIST_SOURCE),
    ),
    {
      threadIds: [],
      hasNextPage: false,
      endCursor: null,
      lastLoadedActivityAt: null,
    },
  );
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
    {
      tier: AiModelTier.fast,
      modelId: MODEL_ID,
      requiredDataResidencyRegion: null,
      isZeroDataRetentionRequired: false,
    },
  ]);
};
