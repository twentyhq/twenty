import { createState } from 'twenty-ui';

export const mainContextStoreComponentInstanceIdState = createState<
  string | null
>({
  key: 'mainContextStoreComponentInstanceIdState',
  defaultValue: null,
});
