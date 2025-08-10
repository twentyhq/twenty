import { atom } from 'recoil';

import { type ProfilingDataPoint } from '~/testing/profiling/types/ProfilingDataPoint';

export const profilingSessionState = atom<Record<string, ProfilingDataPoint[]>>(
  {
    key: 'profilingSessionState',
    default: {},
  },
);
