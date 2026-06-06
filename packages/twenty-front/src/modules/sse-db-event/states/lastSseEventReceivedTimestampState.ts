import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const lastSseEventReceivedTimestampState = createAtomState<
  number | null
>({
  key: 'lastSseEventReceivedTimestampState',
  defaultValue: null,
});
