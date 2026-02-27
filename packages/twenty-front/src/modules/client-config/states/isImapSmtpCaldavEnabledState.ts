import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const isImapSmtpCaldavEnabledState = createAtomState<boolean>({
  key: 'isImapSmtpCaldavEnabled',
  defaultValue: false,
});
