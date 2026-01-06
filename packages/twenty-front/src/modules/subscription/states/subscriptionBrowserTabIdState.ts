import { createState } from 'twenty-ui/utilities';

export const subscriptionBrowserTabIdState = createState<string | undefined>({
  key: 'subscriptionBrowserTabIdState',
  defaultValue: undefined,
});
