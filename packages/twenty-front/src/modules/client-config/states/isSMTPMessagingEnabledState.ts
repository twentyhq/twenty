import { createState } from 'twenty-ui/utilities';

export const isSMTPMessagingEnabledState = createState<boolean>({
  key: 'isSMTPMessagingEnabled',
  defaultValue: true,
});
