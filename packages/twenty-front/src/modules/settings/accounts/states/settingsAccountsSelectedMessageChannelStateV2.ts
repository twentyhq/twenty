import { type MessageChannel } from '@/accounts/types/MessageChannel';

import { createStateV2 } from '@/ui/utilities/state/jotai/utils/createStateV2';

export const settingsAccountsSelectedMessageChannelStateV2 =
  createStateV2<MessageChannel | null>({
    key: 'settingsAccountsSelectedMessageChannelStateV2',
    defaultValue: null,
  });
