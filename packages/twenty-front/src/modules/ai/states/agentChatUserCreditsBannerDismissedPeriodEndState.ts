import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const agentChatUserCreditsBannerDismissedPeriodEndState =
  createAtomState<string | null>({
    key: 'ai/agentChatUserCreditsBannerDismissedPeriodEnd',
    defaultValue: null,
    useLocalStorage: true,
  });
