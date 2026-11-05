import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const sseEventStreamCreatedAtTimestampState = createAtomState<
  number | null
>({
  key: 'sseEventStreamCreatedAtTimestampState',
  defaultValue: null,
});
