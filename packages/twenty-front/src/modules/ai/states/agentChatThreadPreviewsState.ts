import { type AgentChatThreadPreview } from '~/generated-metadata/graphql';
import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export type AgentChatThreadPreviewEntry = {
  // The activity the preview was requested for, so new activity refetches
  // it. Missing after a failed request so it is asked again
  lastActivityAt?: string | null;
  preview: AgentChatThreadPreview | null;
};

export const agentChatThreadPreviewsState = createAtomState<
  Record<string, AgentChatThreadPreviewEntry>
>({
  key: 'ai/agentChatThreadPreviewsState',
  defaultValue: {},
});
