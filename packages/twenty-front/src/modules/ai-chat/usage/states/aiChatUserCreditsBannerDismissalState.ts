import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const aiChatUserCreditsBannerDismissalState = createAtomState<{
  workspaceMemberId: string;
  periodEnd: string;
  isFallingBackToWorkspaceCredits: boolean;
} | null>({
  key: 'ai/agentChatUserCreditsBannerDismissal',
  defaultValue: null,
  useLocalStorage: true,
});
