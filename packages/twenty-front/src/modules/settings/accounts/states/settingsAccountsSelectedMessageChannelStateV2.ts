import { type MessageChannel } from '@/accounts/types/MessageChannel';

import { createState } from '@/ui/utilities/state/jotai/utils/createState';

export const settingsAccountsSelectedMessageChannelStateV2 =
  createState<MessageChannel | null>({
    key: 'settingsAccountsSelectedMessageChannelStateV2',
    defaultValue: null,
  });
