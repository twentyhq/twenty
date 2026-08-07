import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const selectedInboxNotificationIdState = createAtomState<string | null>({
  key: 'ai/expanded-chat/selectedInboxNotificationIdState',
  defaultValue: null,
});
