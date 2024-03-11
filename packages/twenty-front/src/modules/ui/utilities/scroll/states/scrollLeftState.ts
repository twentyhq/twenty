import { createState } from '@/ui/utilities/state/utils/createState';

export const scrollLeftState = createState<number>({
  key: 'scroll/scrollLeftState',
  defaultValue: 0,
});
