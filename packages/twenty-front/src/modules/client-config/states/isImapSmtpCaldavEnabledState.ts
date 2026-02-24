import { createState } from '@/ui/utilities/state/jotai/utils/createState';

export const isImapSmtpCaldavEnabledState = createState<boolean>({
  key: 'isImapSmtpCaldavEnabled',
  defaultValue: false,
});
