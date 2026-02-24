import { createState } from '@/ui/utilities/state/jotai/utils/createState';

export type ProfilingQueue = {
  [runName: string]: string[];
};

export const profilingQueueState = createState<ProfilingQueue>({
  key: 'profilingQueueState',
  defaultValue: {},
});
