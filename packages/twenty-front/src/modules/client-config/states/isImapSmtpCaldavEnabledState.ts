import { createState } from '@/ui/utilities/state/utils/createState';

export const isImapSmtpCaldavEnabledState = createState<boolean>({
  key: 'isImapSmtpCaldavEnabled',
  defaultValue: false,
});
