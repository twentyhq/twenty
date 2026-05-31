import { useLingui } from '@lingui/react/macro';
import { IconFolder } from 'twenty-ui/display';

import { pendingInsertionNavigationMenuItemState } from '@/navigation-menu-item/common/states/pendingInsertionNavigationMenuItemState';
import { useAddFolderToNavigationMenuDraft } from '@/navigation-menu-item/edit/folder/hooks/useAddFolderToNavigationMenuDraft';
import { useOpenNavigationMenuItemInSidePanel } from '@/navigation-menu-item/edit/hooks/useOpenNavigationMenuItemInSidePanel';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';

export const useAddFolderToNavigationMenu = () => {
  const { t } = useLingui();
  const { addFolderToDraft } = useAddFolderToNavigationMenuDraft();
  const { openNavigationMenuItemInSidePanel } =
    useOpenNavigationMenuItemInSidePanel();
  const [
    pendingInsertionNavigationMenuItem,
    setPendingInsertionNavigationMenuItem,
  ] = useAtomState(pendingInsertionNavigationMenuItemState);

  const handleAddFolder = () => {
    const itemId = addFolderToDraft(
      t`New folder`,
      pendingInsertionNavigationMenuItem?.folderId ?? null,
      pendingInsertionNavigationMenuItem?.position,
    );

    setPendingInsertionNavigationMenuItem(null);
    openNavigationMenuItemInSidePanel({
      itemId,
      pageTitle: t`Edit folder`,
      pageIcon: IconFolder,
      focusTitleInput: true,
    });
  };

  return { handleAddFolder };
};
