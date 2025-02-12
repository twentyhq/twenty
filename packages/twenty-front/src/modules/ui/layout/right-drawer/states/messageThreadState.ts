import { createState } from '@ui/utilities/state/utils/createState';

import { MessageThread } from '@/activities/emails/types/MessageThread';

export const messageThreadState = createState<MessageThread | null>({
  key: 'messageThreadState',
  defaultValue: null,
});
