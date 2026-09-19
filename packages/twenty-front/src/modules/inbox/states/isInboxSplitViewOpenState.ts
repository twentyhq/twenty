import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

// Raised while the inbox page is mounted, so the drawer and the side panel can
// tell that the page is already split in two.
export const isInboxSplitViewOpenState = createAtomState<boolean>({
  key: 'inbox/isInboxSplitViewOpenState',
  defaultValue: false,
});
