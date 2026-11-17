import { INBOX_NOTIFICATION_LEVEL } from '@/inbox/constants/InboxNotificationLevel';
import { type InboxNotificationLevel } from '@/inbox/types/InboxNotificationLevel';
import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const inboxNotificationLevelState =
  createAtomState<InboxNotificationLevel>({
    key: 'inboxNotificationLevelState',
    defaultValue: INBOX_NOTIFICATION_LEVEL.ALL_FOLLOWED,
    useLocalStorage: true,
    localStorageOptions: { getOnInit: true },
    validateInitFn: (level) =>
      Object.values(INBOX_NOTIFICATION_LEVEL).includes(level),
  });
