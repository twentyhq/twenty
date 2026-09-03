import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

// Whether the drawer was open when the inbox pushed it aside for a side
// panel, so it can come back the way the person left it once the panel goes
export const wasNavigationDrawerExpandedBeforeInboxPanelState =
  createAtomState<boolean>({
    key: 'inbox/wasNavigationDrawerExpandedBeforeInboxPanelState',
    defaultValue: false,
  });
