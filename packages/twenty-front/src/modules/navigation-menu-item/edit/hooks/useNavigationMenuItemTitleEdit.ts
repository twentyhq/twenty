import { useState } from 'react';

import { navigationMenuItemEditSectionState } from '@/navigation-menu-item/common/states/navigationMenuItemEditSectionState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

type UseNavigationMenuItemTitleEditParams = {
  itemId: string | null;
  itemName: string;
  defaultLabel: string;
  persistName: (name: string) => void;
};

// Title editing for a navigation menu item, section-aware: the workspace
// section writes the in-memory draft on every keystroke (live preview), while
// a personal favorite persists immediately, so keystrokes are buffered locally
// (keyed by item id, self-invalidating on item switch) and committed on save.
export const useNavigationMenuItemTitleEdit = ({
  itemId,
  itemName,
  defaultLabel,
  persistName,
}: UseNavigationMenuItemTitleEditParams) => {
  const navigationMenuItemEditSection = useAtomStateValue(
    navigationMenuItemEditSectionState,
  );
  const isDraftMode = navigationMenuItemEditSection === 'workspace';
  const [localNameEdit, setLocalNameEdit] = useState<{
    itemId: string;
    text: string;
  } | null>(null);

  const bufferedName =
    localNameEdit?.itemId === itemId ? localNameEdit.text : null;
  const value = isDraftMode ? itemName : (bufferedName ?? itemName);

  const handleChange = (text: string) => {
    if (isDraftMode) {
      persistName(text);
    } else if (itemId !== null) {
      setLocalNameEdit({ itemId, text });
    }
  };

  const handleSave = () => {
    const trimmed = value.trim();
    const finalName = trimmed.length > 0 ? trimmed : defaultLabel;
    if (finalName !== itemName) {
      persistName(finalName);
    }
    if (!isDraftMode) {
      setLocalNameEdit(null);
    }
  };

  return { value, handleChange, handleSave };
};
