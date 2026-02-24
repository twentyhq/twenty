import { createStateV2 } from '@/ui/utilities/state/jotai/utils/createStateV2';

export const sseEventStreamIdState = createStateV2<string | null>({
  key: 'sseEventStreamIdState',
  defaultValue: null,
});
