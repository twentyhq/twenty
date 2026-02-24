import { createState } from '@/ui/utilities/state/jotai/utils/createState';

import { type ProfilingDataPoint } from '~/testing/profiling/types/ProfilingDataPoint';

export const profilingSessionState = createState<
  Record<string, ProfilingDataPoint[]>
>({
  key: 'profilingSessionState',
  defaultValue: {},
});
