import {
  DEFAULT_AI_CHAT_ASSISTANT_PROFILE,
  getAiChatAssistantProfileSchema,
  type AiChatAssistantProfile,
} from 'twenty-shared/ai';
import { isDefined } from 'twenty-shared/utils';

import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { createAtomSelector } from '@/ui/utilities/state/jotai/utils/createAtomSelector';

const ASSISTANT_PROFILE_SCHEMA = getAiChatAssistantProfileSchema();

export const aiChatAssistantProfileSelector =
  createAtomSelector<AiChatAssistantProfile>({
    key: 'aiChatAssistantProfileSelector',
    get: ({ get }) => {
      const currentWorkspace = get(currentWorkspaceState);

      return isDefined(currentWorkspace)
        ? ASSISTANT_PROFILE_SCHEMA.parse(
            currentWorkspace.aiChatAssistantProfile,
          )
        : DEFAULT_AI_CHAT_ASSISTANT_PROFILE;
    },
  });
