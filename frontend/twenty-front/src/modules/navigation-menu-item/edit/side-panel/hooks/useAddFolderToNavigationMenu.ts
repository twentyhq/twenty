import { useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';
import { IconFolder } from 'twenty-ui/display';

import { useAddFolderToNavigationMenuDraft } from '@/navigation-menu-item/edit/folder/hooks/useAddFolderToNavigationMenuDraft';
import { useNavigationMenuItemsDraftState } from '@/navigation-menu-item/edit/hooks/useNavigationMenuItemsDraftState';
import { useOpenNavigationMenuItemInSidePanel } from '@/navigation-menu-item/edit/hooks/useOpenNavigationMenuItemInSidePanel';
import { pendingInsertionNavigationMenuItemState } from '@/navigation-menu-item/common/states/pendingInsertionNavigationMenuItemState';
import { navigationMenuItemsDraftState } from '@/navigation-menu-item/common/states/navigationMenuItemsDraftState';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

export const useAddFolderToNavigationMenu = () => {
  const { t } = useLingui();
  const { addFolderToDraft } = useAddFolderToNavigationMenuDraft();
  const { workspaceNavigationMenuItems } = useNavigationMenuItemsDraftState();
  const navigationMenuItemsDraft = useAtomStateValue(
    navigationMenuItemsDraftState,
  );
  const { openNavigationMenuItemInSidePanel } =
    useOpenNavigationMenuItemInSidePanel();
  const [
    pendingInsertionNavigationMenuItem,
    setPendingInsertionNavigationMenuItem,
  ] = useAtomState(pendingInsertionNavigationMenuItemState);

  const currentDraft = isDefined(navigationMenuItemsDraft)
    ? navigationMenuItemsDraft
    : workspaceNavigationMenuItems;

  const handleAddFolder = () => {
    const itemId = addFolderToDraft(
      t`New folder`,
      currentDraft,
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
