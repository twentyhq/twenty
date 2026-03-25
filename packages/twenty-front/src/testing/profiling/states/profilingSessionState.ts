import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

import { type ProfilingDataPoint } from '~/testing/profiling/types/ProfilingDataPoint';

export const profilingSessionState = createAtomState<
  Record<string, ProfilingDataPoint[]>
>({
  key: 'profilingSessionState',
  defaultValue: {},
});
