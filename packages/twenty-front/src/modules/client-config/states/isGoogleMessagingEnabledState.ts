import { createState } from 'twenty-ui';

export const isGoogleMessagingEnabledState = createState<boolean>({
  key: 'isGoogleMessagingEnabled',
  defaultValue: false,
});
