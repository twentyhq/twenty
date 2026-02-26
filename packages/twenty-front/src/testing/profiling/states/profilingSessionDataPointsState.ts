import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

import { type ProfilingDataPoint } from '~/testing/profiling/types/ProfilingDataPoint';

export const profilingSessionDataPointsState = createAtomState<
  ProfilingDataPoint[]
>({
  key: 'profilingSessionDataPointsState',
  defaultValue: [],
});
