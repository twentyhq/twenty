import { createState } from 'twenty-ui';

export const isDefaultLayoutAuthModalVisibleState = createState<
  boolean | undefined
>({
  key: 'isDefaultLayoutAuthModalVisibleState',
  defaultValue: undefined,
});
