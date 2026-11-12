import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const agentChatThreadRecordUpdateCountState = createAtomState<number>({
  key: 'agentChatThreadRecordUpdateCountState',
  defaultValue: 0,
});
