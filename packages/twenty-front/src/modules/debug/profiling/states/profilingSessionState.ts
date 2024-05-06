import { atom } from 'recoil';

import { ProfilingDataPoint } from '@/debug/profiling/types/ProfilingDataPoint';

export const profilingSessionState = atom<Record<string, ProfilingDataPoint[]>>(
  {
    key: 'profilingSessionState',
    default: {},
  },
);
