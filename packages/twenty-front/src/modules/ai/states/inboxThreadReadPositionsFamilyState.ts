import { type InboxThreadReadPosition } from '@/ai/types/InboxThreadReadPosition';
import { createAtomFamilyState } from '@/ui/utilities/state/jotai/utils/createAtomFamilyState';

export const inboxThreadReadPositionsFamilyState = createAtomFamilyState<
  InboxThreadReadPosition[] | null,
  { threadId: string | null }
>({
  key: 'inboxThreadReadPositionsFamilyState',
  defaultValue: null,
});
