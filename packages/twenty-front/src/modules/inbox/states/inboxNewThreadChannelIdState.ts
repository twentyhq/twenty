import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const inboxNewThreadChannelIdState = createAtomState<string | null>({
  key: 'ai/inboxNewThreadChannelIdState',
  defaultValue: null,
});
