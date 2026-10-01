import { type AgentChatThreadPreview } from '~/generated-metadata/graphql';
import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export type AgentChatThreadPreviewEntry = {
  // The activity the preview was fetched for, so new activity refetches it
  lastActivityAt: string | null;
  preview: AgentChatThreadPreview | null;
};

export const agentChatThreadPreviewsState = createAtomState<
  Record<string, AgentChatThreadPreviewEntry>
>({
  key: 'ai/agentChatThreadPreviewsState',
  defaultValue: {},
});
