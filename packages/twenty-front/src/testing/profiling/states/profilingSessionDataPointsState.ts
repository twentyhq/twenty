import { createState } from '@/ui/utilities/state/jotai/utils/createState';

import { type ProfilingDataPoint } from '~/testing/profiling/types/ProfilingDataPoint';

export const profilingSessionDataPointsState = createState<
  ProfilingDataPoint[]
>({
  key: 'profilingSessionDataPointsState',
  defaultValue: [],
});
