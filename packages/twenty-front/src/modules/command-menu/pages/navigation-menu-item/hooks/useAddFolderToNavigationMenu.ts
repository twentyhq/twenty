import { useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';
import { IconFolder } from 'twenty-ui/display';

import { useAddFolderToNavigationMenuDraft } from '@/navigation-menu-item/hooks/useAddFolderToNavigationMenuDraft';
import { useNavigationMenuItemsDraftState } from '@/navigation-menu-item/hooks/useNavigationMenuItemsDraftState';
import { useOpenNavigationMenuItemInCommandMenu } from '@/navigation-menu-item/hooks/useOpenNavigationMenuItemInCommandMenu';
import { addMenuItemInsertionContextStateV2 } from '@/navigation-menu-item/states/addMenuItemInsertionContextStateV2';
import { navigationMenuItemsDraftStateV2 } from '@/navigation-menu-item/states/navigationMenuItemsDraftStateV2';
import { selectedNavigationMenuItemInEditModeStateV2 } from '@/navigation-menu-item/states/selectedNavigationMenuItemInEditModeStateV2';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';

export const useAddFolderToNavigationMenu = () => {
  const { t } = useLingui();
  const { addFolderToDraft } = useAddFolderToNavigationMenuDraft();
  const { workspaceNavigationMenuItems } = useNavigationMenuItemsDraftState();
  const navigationMenuItemsDraft = useAtomStateValue(
    navigationMenuItemsDraftStateV2,
  );
  const setSelectedNavigationMenuItemInEditMode = useSetAtomState(
    selectedNavigationMenuItemInEditModeStateV2,
  );
  const { openNavigationMenuItemInCommandMenu } =
    useOpenNavigationMenuItemInCommandMenu();
  const addMenuItemInsertionContext = useAtomStateValue(
    addMenuItemInsertionContextStateV2,
  );
  const setAddMenuItemInsertionContext = useSetAtomState(
    addMenuItemInsertionContextStateV2,
  );

  const currentDraft = isDefined(navigationMenuItemsDraft)
    ? navigationMenuItemsDraft
    : workspaceNavigationMenuItems;

  const handleAddFolder = () => {
    const targetFolderId = addMenuItemInsertionContext?.targetFolderId ?? null;
    const targetIndex = addMenuItemInsertionContext?.targetIndex;

    const itemId = addFolderToDraft(
      t`New folder`,
      currentDraft,
      targetFolderId,
      targetIndex,
    );

    setAddMenuItemInsertionContext(null);
    setSelectedNavigationMenuItemInEditMode(itemId);
    openNavigationMenuItemInCommandMenu({
      pageTitle: t`Edit folder`,
      pageIcon: IconFolder,
      focusTitleInput: true,
    });
  };

  return { handleAddFolder };
};
