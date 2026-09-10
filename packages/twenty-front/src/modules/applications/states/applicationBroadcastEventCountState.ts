import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const applicationBroadcastEventCountState = createAtomState<number>({
  key: 'applicationBroadcastEventCountState',
  defaultValue: 0,
});
