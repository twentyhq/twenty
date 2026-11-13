import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const closingInboxThreadIdState = createAtomState<string | null>({
  key: 'ai/closingInboxThreadIdState',
  defaultValue: null,
});
