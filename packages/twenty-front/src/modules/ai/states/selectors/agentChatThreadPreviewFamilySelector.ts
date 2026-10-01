import { agentChatThreadPreviewsState } from '@/ai/states/agentChatThreadPreviewsState';
import { type AgentChatThreadPreview } from '~/generated-metadata/graphql';
import { createAtomFamilySelector } from '@/ui/utilities/state/jotai/utils/createAtomFamilySelector';

export const agentChatThreadPreviewFamilySelector = createAtomFamilySelector<
  AgentChatThreadPreview | null,
  string
>({
  key: 'agentChatThreadPreviewFamilySelector',
  get:
    (threadId) =>
    ({ get }) =>
      get(agentChatThreadPreviewsState)[threadId]?.preview ?? null,
});
