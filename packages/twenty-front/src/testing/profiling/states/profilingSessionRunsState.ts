import { createStateV2 } from '@/ui/utilities/state/jotai/utils/createStateV2';

export const profilingSessionRunsState = createStateV2<string[]>({
  key: 'profilingSessionRunsState',
  defaultValue: [],
});
