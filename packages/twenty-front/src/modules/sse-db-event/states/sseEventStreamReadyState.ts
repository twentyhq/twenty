import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const sseEventStreamReadyState = createAtomState<boolean>({
  key: 'sseEventStreamReadyState',
  defaultValue: false,
});
