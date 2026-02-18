import { useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';
import { IconLink } from 'twenty-ui/display';

import { useAddLinkToNavigationMenuDraft } from '@/navigation-menu-item/hooks/useAddLinkToNavigationMenuDraft';
import { useNavigationMenuItemsDraftState } from '@/navigation-menu-item/hooks/useNavigationMenuItemsDraftState';
import { useOpenNavigationMenuItemInCommandMenu } from '@/navigation-menu-item/hooks/useOpenNavigationMenuItemInCommandMenu';
import { addMenuItemInsertionContextStateV2 } from '@/navigation-menu-item/states/addMenuItemInsertionContextStateV2';
import { navigationMenuItemsDraftStateV2 } from '@/navigation-menu-item/states/navigationMenuItemsDraftStateV2';
import { selectedNavigationMenuItemInEditModeStateV2 } from '@/navigation-menu-item/states/selectedNavigationMenuItemInEditModeStateV2';
import { useRecoilValueV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilValueV2';
import { useSetRecoilStateV2 } from '@/ui/utilities/state/jotai/hooks/useSetRecoilStateV2';

export const useAddLinkToNavigationMenu = () => {
  const { t } = useLingui();
  const { addLinkToDraft } = useAddLinkToNavigationMenuDraft();
  const { workspaceNavigationMenuItems } = useNavigationMenuItemsDraftState();
  const navigationMenuItemsDraft = useRecoilValueV2(
    navigationMenuItemsDraftStateV2,
  );
  const setSelectedNavigationMenuItemInEditMode = useSetRecoilStateV2(
    selectedNavigationMenuItemInEditModeStateV2,
  );
  const { openNavigationMenuItemInCommandMenu } =
    useOpenNavigationMenuItemInCommandMenu();
  const addMenuItemInsertionContext = useRecoilValueV2(
    addMenuItemInsertionContextStateV2,
  );
  const setAddMenuItemInsertionContext = useSetRecoilStateV2(
    addMenuItemInsertionContextStateV2,
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
