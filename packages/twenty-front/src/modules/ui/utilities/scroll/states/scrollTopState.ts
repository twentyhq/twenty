import { createState } from 'twenty-ui';

export const scrollTopState = createState<number>({
  key: 'scroll/scrollTopState',
  defaultValue: 0,
});
