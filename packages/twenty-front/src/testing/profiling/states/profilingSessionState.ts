import { createStateV2 } from '@/ui/utilities/state/jotai/utils/createStateV2';

import { type ProfilingDataPoint } from '~/testing/profiling/types/ProfilingDataPoint';

export const profilingSessionState = createStateV2<
  Record<string, ProfilingDataPoint[]>
>({
  key: 'profilingSessionState',
  defaultValue: {},
});
