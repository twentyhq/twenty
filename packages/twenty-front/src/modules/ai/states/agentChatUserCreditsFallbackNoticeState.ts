import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const agentChatUserCreditsFallbackNoticeState = createAtomState<{
  renewsAt: string;
} | null>({
  key: 'ai/agentChatUserCreditsFallbackNotice',
  defaultValue: null,
});
