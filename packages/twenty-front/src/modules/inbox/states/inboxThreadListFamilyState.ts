import { type InboxLoadedThreadList } from '@/inbox/types/InboxLoadedThreadList';
import { createAtomFamilyState } from '@/ui/utilities/state/jotai/utils/createAtomFamilyState';

export const inboxThreadListFamilyState = createAtomFamilyState<
  InboxLoadedThreadList | null,
  string
>({
  key: 'inboxThreadListFamilyState',
  defaultValue: null,
});
