import { createStateV2 } from '@/ui/utilities/state/jotai/utils/createStateV2';

export const sseEventStreamReadyState = createStateV2<boolean>({
  key: 'sseEventStreamReadyState',
  defaultValue: false,
});
