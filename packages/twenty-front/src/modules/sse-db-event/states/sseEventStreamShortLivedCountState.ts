import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const sseEventStreamShortLivedCountState = createAtomState<number>({
  key: 'sseEventStreamShortLivedCountState',
  defaultValue: 0,
});
