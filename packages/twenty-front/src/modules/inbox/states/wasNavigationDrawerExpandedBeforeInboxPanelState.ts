import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

// Whether the drawer was open when the inbox pushed it aside for a side panel.
// Persisted like the drawer preference it protects, so a reload with the panel
// still open does not turn the temporary collapse into the preference.
export const wasNavigationDrawerExpandedBeforeInboxPanelState =
  createAtomState<boolean>({
    key: 'inbox/wasNavigationDrawerExpandedBeforeInboxPanelState',
    defaultValue: false,
    useLocalStorage: true,
  });
