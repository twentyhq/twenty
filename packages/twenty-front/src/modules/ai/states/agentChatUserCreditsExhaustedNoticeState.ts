import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const agentChatUserCreditsExhaustedNoticeState = createAtomState<{
  renewsAt: string;
  isFallingBackToWorkspaceCredits: boolean;
} | null>({
  key: 'ai/agentChatUserCreditsExhaustedNotice',
  defaultValue: null,
});
