import { createStateV2 } from '@/ui/utilities/state/jotai/utils/createStateV2';

export const currentProfilingRunIndexState = createStateV2<number>({
  key: 'currentProfilingRunIndexState',
  defaultValue: 0,
});
