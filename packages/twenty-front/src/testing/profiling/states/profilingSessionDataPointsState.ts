import { atom } from 'recoil';

import { type ProfilingDataPoint } from '~/testing/profiling/types/ProfilingDataPoint';

export const profilingSessionDataPointsState = atom<ProfilingDataPoint[]>({
  key: 'profilingSessionDataPointsState',
  default: [],
});
