import { atom } from 'recoil';

import { type MessageChannel } from '@/accounts/types/MessageChannel';

export const settingsAccountsSelectedMessageChannelState =
  atom<MessageChannel | null>({
    key: 'settingsAccountsSelectedMessageChannelState',
    default: null,
  });
