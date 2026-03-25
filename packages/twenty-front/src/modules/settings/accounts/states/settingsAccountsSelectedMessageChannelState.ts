import { type MessageChannel } from '@/accounts/types/MessageChannel';

import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const settingsAccountsSelectedMessageChannelState =
  createAtomState<MessageChannel | null>({
    key: 'settingsAccountsSelectedMessageChannelState',
    defaultValue: null,
  });
