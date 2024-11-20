import { createState } from 'twenty-ui';

export const mainContextStoreComponentInstanceIdState = createState<string>({
  key: 'mainContextStoreComponentInstanceIdState',
  defaultValue: 'app',
});
