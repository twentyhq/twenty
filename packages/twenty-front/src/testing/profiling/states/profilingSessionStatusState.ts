import { createStateV2 } from '@/ui/utilities/state/jotai/utils/createStateV2';

export type ProfilingSessionStatus = 'running' | 'finished' | 'not_started';

export const profilingSessionStatusState =
  createStateV2<ProfilingSessionStatus>({
    key: 'profilingSessionStatusState',
    defaultValue: 'not_started',
  });
