import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const sseEventStreamIdState = createAtomState<string | null>({
  key: 'sseEventStreamIdState',
  defaultValue: null,
});
