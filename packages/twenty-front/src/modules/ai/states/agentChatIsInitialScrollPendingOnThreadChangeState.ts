import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const agentChatIsInitialScrollPendingOnThreadChangeState =
  createAtomState<boolean>({
    key: 'ai/agentChatIsInitialScrollPendingOnThreadChangeState',
    defaultValue: false,
  });
