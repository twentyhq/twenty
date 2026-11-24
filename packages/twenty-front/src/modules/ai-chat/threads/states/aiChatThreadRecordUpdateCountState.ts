import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const aiChatThreadRecordUpdateCountState = createAtomState<number>({
  key: 'aiChatThreadRecordUpdateCountState',
  defaultValue: 0,
});
