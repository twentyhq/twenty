import { createState } from 'twenty-ui';

export const mainContextStoreComponentInstanceId = createState<string | null>({
  key: 'mainContextStoreComponentInstanceId',
  defaultValue: null,
});
