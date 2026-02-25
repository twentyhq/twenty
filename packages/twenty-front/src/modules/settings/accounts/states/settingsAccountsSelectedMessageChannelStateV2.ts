import { type MessageChannel } from '@/accounts/types/MessageChannel';

import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const settingsAccountsSelectedMessageChannelStateV2 =
  createAtomState<MessageChannel | null>({
    key: 'settingsAccountsSelectedMessageChannelStateV2',
    defaultValue: null,
  });
