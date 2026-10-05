import { useEffect } from 'react';

import { navigationMenuItemInsertionPreviewState } from '@/navigation-menu-item/common/states/navigationMenuItemInsertionPreviewState';
import { type NavigationMenuItemSection } from '@/navigation-menu-item/common/types/NavigationMenuItemSection';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';

type NavigationMenuItemInsertionPreviewEffectProps = {
  dropdownId: string;
  section: NavigationMenuItemSection;
  folderId: string | null;
  index: number;
};

// The preview follows the add flow's lifetime, including nested menu pages,
// and re-syncs while it stays open as the insertion point moves.
export const NavigationMenuItemInsertionPreviewEffect = ({
  dropdownId,
  section,
  folderId,
  index,
}: NavigationMenuItemInsertionPreviewEffectProps) => {
  const setNavigationMenuItemInsertionPreview = useSetAtomState(
    navigationMenuItemInsertionPreviewState,
  );

  useEffect(() => {
    setNavigationMenuItemInsertionPreview({
      dropdownId,
      section,
      folderId,
      index,
    });

    return () =>
      setNavigationMenuItemInsertionPreview((preview) =>
        preview?.dropdownId === dropdownId ? null : preview,
      );
  }, [
    dropdownId,
    section,
    folderId,
    index,
    setNavigationMenuItemInsertionPreview,
  ]);

  return <></>;
};
