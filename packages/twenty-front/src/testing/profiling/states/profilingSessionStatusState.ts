import { createState } from '@/ui/utilities/state/jotai/utils/createState';

export type ProfilingSessionStatus = 'running' | 'finished' | 'not_started';

export const profilingSessionStatusState = createState<ProfilingSessionStatus>({
  key: 'profilingSessionStatusState',
  defaultValue: 'not_started',
});
