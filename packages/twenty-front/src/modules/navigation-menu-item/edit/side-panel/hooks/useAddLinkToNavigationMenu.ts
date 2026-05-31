import { useLingui } from '@lingui/react/macro';
import { IconLink } from 'twenty-ui/display';

import { pendingInsertionNavigationMenuItemState } from '@/navigation-menu-item/common/states/pendingInsertionNavigationMenuItemState';
import { useOpenNavigationMenuItemInSidePanel } from '@/navigation-menu-item/edit/hooks/useOpenNavigationMenuItemInSidePanel';
import { useAddLinkToNavigationMenuDraft } from '@/navigation-menu-item/edit/link/hooks/useAddLinkToNavigationMenuDraft';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';

export const useAddLinkToNavigationMenu = () => {
  const { t } = useLingui();
  const { addLinkToDraft } = useAddLinkToNavigationMenuDraft();
  const { openNavigationMenuItemInSidePanel } =
    useOpenNavigationMenuItemInSidePanel();
  const [
    pendingInsertionNavigationMenuItem,
    setPendingInsertionNavigationMenuItem,
  ] = useAtomState(pendingInsertionNavigationMenuItemState);

  const handleAddLink = () => {
    const itemId = addLinkToDraft(
      t`Link label`,
      'www.example.com',
      pendingInsertionNavigationMenuItem?.folderId ?? null,
      pendingInsertionNavigationMenuItem?.position,
    );

    setPendingInsertionNavigationMenuItem(null);
    openNavigationMenuItemInSidePanel({
      itemId,
      pageTitle: t`Edit link`,
      pageIcon: IconLink,
      focusTitleInput: true,
    });
  };

  return { handleAddLink };
};
