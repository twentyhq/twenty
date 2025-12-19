import { createState } from 'twenty-ui/utilities';

export const isImapSmtpCaldavEnabledState = createState<boolean>({
  key: 'isImapSmtpCaldavEnabled',
  defaultValue: false,
});
