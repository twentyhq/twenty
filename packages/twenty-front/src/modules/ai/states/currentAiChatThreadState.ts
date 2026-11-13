import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const currentInboxThreadState = createAtomState<string | null>({
  key: 'ai/currentInboxThreadState',
  defaultValue: null,
});
