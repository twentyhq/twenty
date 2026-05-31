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
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';

// Single source of the workspace-draft vs. immediate-persistence fork for the
// add/edit side panel, mirroring useHandleNavigationMenuItemDragAndDrop:
// the workspace section stages changes in the draft (saved on layout exit),
// while the favorite section creates/updates/deletes personal items immediately.
export const useNavigationMenuItemEditController = () => {
  const section = useAtomStateValue(navigationMenuItemEditSectionState);
  const { navigationMenuItems, currentWorkspaceMemberId } =
    useNavigationMenuItemsData();
  const { currentDraft } = useDraftNavigationMenuItems();
  const setNavigationMenuItemsDraft = useSetAtomState(
    navigationMenuItemsDraftState,
  );
  const { createManyNavigationMenuItems } = useCreateManyNavigationMenuItems();
  const { updateManyNavigationMenuItems } = useUpdateManyNavigationMenuItems();
  const { deleteManyNavigationMenuItems } = useDeleteManyNavigationMenuItems();

  const isDraftMode = section === 'workspace';
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
        return [...current.slice(0, flatIndex), item, ...current.slice(flatIndex)];
      });
      return;
    }

    if (!isDefined(targetUserWorkspaceId)) {
      return;
    }

    await createManyNavigationMenuItems([
      {
        ...buildCreateNavigationMenuItemInput(item, (folderId) => folderId),
        userWorkspaceId: targetUserWorkspaceId,
      },
    ]);
  };

  const applyUpdate = async (
    id: string,
    update: Partial<NavigationMenuItem>,
  ): Promise<void> => {
    if (isDraftMode) {
      setNavigationMenuItemsDraft((draft) =>
        isDefined(draft)
          ? draft.map((item) => (item.id === id ? { ...item, ...update } : item))
          : draft,
      );
      return;
    }

    await updateManyNavigationMenuItems([{ id, update }]);
  };

  const applyDelete = async (ids: string[]): Promise<void> => {
    if (isDraftMode) {
      setNavigationMenuItemsDraft((draft) =>
        isDefined(draft) ? draft.filter((item) => !ids.includes(item.id)) : draft,
      );
      return;
    }

    await deleteManyNavigationMenuItems(ids);
  };

  return {
    section,
    isDraftMode,
    currentItems,
    targetUserWorkspaceId,
    applyCreate,
    applyUpdate,
    applyDelete,
  };
};
