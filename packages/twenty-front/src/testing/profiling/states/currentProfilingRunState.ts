import { createState } from '@/ui/utilities/state/jotai/utils/createState';

export const currentProfilingRunIndexState = createState<number>({
  key: 'currentProfilingRunIndexState',
  defaultValue: 0,
});
