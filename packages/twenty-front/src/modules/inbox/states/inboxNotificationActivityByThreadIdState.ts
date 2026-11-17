import { type InboxNotificationActivity } from '@/inbox/types/InboxNotificationActivity';
import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const inboxNotificationActivityByThreadIdState = createAtomState<
  Record<string, InboxNotificationActivity>
>({
  key: 'inboxNotificationActivityByThreadIdState',
  defaultValue: {},
});
