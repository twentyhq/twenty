import { createState } from '@/ui/utilities/state/jotai/utils/createState';

export const profilingSessionRunsState = createState<string[]>({
  key: 'profilingSessionRunsState',
  defaultValue: [],
});
