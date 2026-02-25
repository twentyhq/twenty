import { useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';
import { IconLink } from 'twenty-ui/display';

import { useAddLinkToNavigationMenuDraft } from '@/navigation-menu-item/hooks/useAddLinkToNavigationMenuDraft';
import { useNavigationMenuItemsDraftState } from '@/navigation-menu-item/hooks/useNavigationMenuItemsDraftState';
import { useOpenNavigationMenuItemInCommandMenu } from '@/navigation-menu-item/hooks/useOpenNavigationMenuItemInCommandMenu';
import { addMenuItemInsertionContextState } from '@/navigation-menu-item/states/addMenuItemInsertionContextState';
import { navigationMenuItemsDraftState } from '@/navigation-menu-item/states/navigationMenuItemsDraftState';
import { selectedNavigationMenuItemInEditModeState } from '@/navigation-menu-item/states/selectedNavigationMenuItemInEditModeState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';

export const useAddLinkToNavigationMenu = () => {
  const { t } = useLingui();
  const { addLinkToDraft } = useAddLinkToNavigationMenuDraft();
  const { workspaceNavigationMenuItems } = useNavigationMenuItemsDraftState();
  const navigationMenuItemsDraft = useAtomStateValue(
    navigationMenuItemsDraftState,
  );
  const setSelectedNavigationMenuItemInEditMode = useSetAtomState(
    selectedNavigationMenuItemInEditModeState,
  );
  const { openNavigationMenuItemInCommandMenu } =
    useOpenNavigationMenuItemInCommandMenu();
  const addMenuItemInsertionContext = useAtomStateValue(
    addMenuItemInsertionContextState,
  );
  const setAddMenuItemInsertionContext = useSetAtomState(
    addMenuItemInsertionContextState,
  );

  const currentDraft = isDefined(navigationMenuItemsDraft)
    ? navigationMenuItemsDraft
    : workspaceNavigationMenuItems;

  const handleAddLink = () => {
    const targetFolderId = addMenuItemInsertionContext?.targetFolderId ?? null;
    const targetIndex = addMenuItemInsertionContext?.targetIndex;

    const itemId = addLinkToDraft(
      t`Link label`,
      'www.example.com',
      currentDraft,
      targetFolderId,
      targetIndex,
    );

    setAddMenuItemInsertionContext(null);
    setSelectedNavigationMenuItemInEditMode(itemId);
    openNavigationMenuItemInCommandMenu({
      pageTitle: t`Edit link`,
      pageIcon: IconLink,
      focusTitleInput: true,
    });
  };

  return { handleAddLink };
};
