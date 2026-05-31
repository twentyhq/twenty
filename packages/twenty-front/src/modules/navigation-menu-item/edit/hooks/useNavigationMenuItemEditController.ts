import { useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';
import { type NavigationMenuItem } from '~/generated-metadata/graphql';

import { useCreateManyNavigationMenuItems } from '@/navigation-menu-item/common/hooks/useCreateManyNavigationMenuItems';
import { useDeleteManyNavigationMenuItems } from '@/navigation-menu-item/common/hooks/useDeleteManyNavigationMenuItems';
import { useUpdateManyNavigationMenuItems } from '@/navigation-menu-item/common/hooks/useUpdateManyNavigationMenuItems';
import { navigationMenuItemEditSectionState } from '@/navigation-menu-item/common/states/navigationMenuItemEditSectionState';
import { navigationMenuItemsDraftState } from '@/navigation-menu-item/common/states/navigationMenuItemsDraftState';
import { buildCreateNavigationMenuItemInput } from '@/navigation-menu-item/common/utils/buildCreateNavigationMenuItemInput';
import { useNavigationMenuItemsData } from '@/navigation-menu-item/display/hooks/useNavigationMenuItemsData';
import { useDraftNavigationMenuItems } from '@/navigation-menu-item/edit/hooks/useDraftNavigationMenuItems';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';

// Single source of the workspace-draft vs. immediate-persistence fork for the
// add/edit side panel, mirroring useHandleNavigationMenuItemDragAndDrop:
// the workspace section stages changes in the draft (saved on layout exit),
// while the favorite section creates/updates/deletes personal items immediately.
// The immediate path is optimistic (the mutation hooks roll back on failure), so
// errors are surfaced here and the rejection is swallowed — callers fire-and-forget.
export const useNavigationMenuItemEditController = () => {
  const { t } = useLingui();
  const { enqueueErrorSnackBar } = useSnackBar();
  const navigationMenuItemEditSection = useAtomStateValue(
    navigationMenuItemEditSectionState,
  );
  const { navigationMenuItems, currentWorkspaceMemberId } =
    useNavigationMenuItemsData();
  const { currentDraft } = useDraftNavigationMenuItems();
  const setNavigationMenuItemsDraft = useSetAtomState(
    navigationMenuItemsDraftState,
  );
  const { createManyNavigationMenuItems } = useCreateManyNavigationMenuItems();
  const { updateManyNavigationMenuItems } = useUpdateManyNavigationMenuItems();
  const { deleteManyNavigationMenuItems } = useDeleteManyNavigationMenuItems();

  const isDraftMode = navigationMenuItemEditSection === 'workspace';
  const currentItems = isDraftMode ? currentDraft : navigationMenuItems;
  const targetUserWorkspaceId = isDraftMode
    ? undefined
    : currentWorkspaceMemberId;

  const applyCreate = async (
    item: NavigationMenuItem,
    flatIndex: number,
  ): Promise<void> => {
    if (isDraftMode) {
      setNavigationMenuItemsDraft((draft) => {
        const current = draft ?? [];
        return [
          ...current.slice(0, flatIndex),
          item,
          ...current.slice(flatIndex),
        ];
      });
      return;
    }

    if (!isDefined(targetUserWorkspaceId)) {
      return;
    }

    try {
      await createManyNavigationMenuItems([
        {
          ...buildCreateNavigationMenuItemInput(item, (folderId) => folderId),
          userWorkspaceId: targetUserWorkspaceId,
        },
      ]);
    } catch {
      enqueueErrorSnackBar({ message: t`Couldn't add to favorites` });
    }
  };

  const applyUpdate = async (
    id: string,
    update: Partial<NavigationMenuItem>,
  ): Promise<void> => {
    if (isDraftMode) {
      setNavigationMenuItemsDraft((draft) =>
        isDefined(draft)
          ? draft.map((item) =>
              item.id === id ? { ...item, ...update } : item,
            )
          : draft,
      );
      return;
    }

    try {
      await updateManyNavigationMenuItems([{ id, update }]);
    } catch {
      enqueueErrorSnackBar({ message: t`Couldn't update favorite` });
    }
  };

  const applyDelete = async (ids: string[]): Promise<void> => {
    if (isDraftMode) {
      setNavigationMenuItemsDraft((draft) =>
        isDefined(draft)
          ? draft.filter((item) => !ids.includes(item.id))
          : draft,
      );
      return;
    }

    try {
      await deleteManyNavigationMenuItems(ids);
    } catch {
      enqueueErrorSnackBar({ message: t`Couldn't remove favorite` });
    }
  };

  return {
    isDraftMode,
    currentItems,
    targetUserWorkspaceId,
    applyCreate,
    applyUpdate,
    applyDelete,
  };
};
