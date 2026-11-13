import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const inboxDisplayedThreadState = createAtomState<string | null>({
  key: 'ai/inboxDisplayedThreadState',
  defaultValue: null,
});
