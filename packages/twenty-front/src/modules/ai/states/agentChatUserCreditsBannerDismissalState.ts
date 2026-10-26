import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const agentChatUserCreditsBannerDismissalState = createAtomState<{
  periodEnd: string;
  isFallingBackToWorkspaceCredits: boolean;
} | null>({
  key: 'ai/agentChatUserCreditsBannerDismissal',
  defaultValue: null,
  useLocalStorage: true,
});
