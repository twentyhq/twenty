import { createStateV2 } from '@/ui/utilities/state/jotai/utils/createStateV2';

export const isImapSmtpCaldavEnabledState = createStateV2<boolean>({
  key: 'isImapSmtpCaldavEnabled',
  defaultValue: false,
});
