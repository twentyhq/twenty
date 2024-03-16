import { createState } from '@/ui/utilities/state/utils/createState';

export const scrollTopState = createState<number>({
  key: 'scroll/scrollTopState',
  defaultValue: 0,
});
