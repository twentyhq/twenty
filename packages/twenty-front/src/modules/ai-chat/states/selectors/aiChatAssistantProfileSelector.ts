import {
  DEFAULT_AI_CHAT_ASSISTANT_PROFILE,
  getAiChatAssistantProfileSchema,
  type AiChatAssistantProfile,
} from 'twenty-shared/ai';

import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { createAtomSelector } from '@/ui/utilities/state/jotai/utils/createAtomSelector';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';

const ASSISTANT_PROFILE_SCHEMA = getAiChatAssistantProfileSchema();

export const aiChatAssistantProfileSelector =
  createAtomSelector<AiChatAssistantProfile>({
    key: 'aiChatAssistantProfileSelector',
    areEqual: isDeeplyEqual,
    get: ({ get }) =>
      ASSISTANT_PROFILE_SCHEMA.safeParse(
        get(currentWorkspaceState)?.aiChatAssistantProfile,
      ).data ?? DEFAULT_AI_CHAT_ASSISTANT_PROFILE,
  });
