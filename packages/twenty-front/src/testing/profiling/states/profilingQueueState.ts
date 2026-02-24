import { createStateV2 } from '@/ui/utilities/state/jotai/utils/createStateV2';

export type ProfilingQueue = {
  [runName: string]: string[];
};

export const profilingQueueState = createStateV2<ProfilingQueue>({
  key: 'profilingQueueState',
  defaultValue: {},
});
