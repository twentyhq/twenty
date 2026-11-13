import { type InboxThreadReadPosition } from '@/ai/types/AgentChatThreadReadPosition';
import { createAtomFamilyState } from '@/ui/utilities/state/jotai/utils/createAtomFamilyState';

export const inboxThreadReadPositionsFamilyState = createAtomFamilyState<
  InboxThreadReadPosition[] | null,
  { threadId: string | null }
>({
  key: 'inboxThreadReadPositionsFamilyState',
  defaultValue: null,
});
