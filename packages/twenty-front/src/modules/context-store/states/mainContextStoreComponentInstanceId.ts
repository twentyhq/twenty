import { CONTEXT_STORE_INSTANCE_ID_DEFAULT_VALUE } from '@/context-store/constants/ContextStoreInstanceIdDefaultValue';
import { createState } from 'twenty-ui';

export const mainContextStoreComponentInstanceIdState = createState<string>({
  key: 'mainContextStoreComponentInstanceIdState',
  defaultValue: CONTEXT_STORE_INSTANCE_ID_DEFAULT_VALUE,
});
