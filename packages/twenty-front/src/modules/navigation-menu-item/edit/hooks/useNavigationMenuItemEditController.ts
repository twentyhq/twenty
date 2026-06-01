import { useLingui } from '@lingui/react/macro';
import { type NavigationMenuItemType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { v4 } from 'uuid';
import { type NavigationMenuItem } from '~/generated-metadata/graphql';

import { useCreateManyNavigationMenuItems } from '@/navigation-menu-item/common/hooks/useCreateManyNavigationMenuItems';
import { useDeleteManyNavigationMenuItems } from '@/navigation-menu-item/common/hooks/useDeleteManyNavigationMenuItems';
import { useUpdateManyNavigationMenuItems } from '@/navigation-menu-item/common/hooks/useUpdateManyNavigationMenuItems';
import { navigationMenuItemEditSectionState } from '@/navigation-menu-item/common/states/navigationMenuItemEditSectionState';
import { navigationMenuItemsDraftState } from '@/navigation-menu-item/common/states/navigationMenuItemsDraftState';
import { buildCreateNavigationMenuItemInput } from '@/navigation-menu-item/common/utils/buildCreateNavigationMenuItemInput';
import { computeInsertIndexAndPosition } from '@/navigation-menu-item/common/utils/computeInsertIndexAndPosition';
import { useNavigationMenuItemsData } from '@/navigation-menu-item/display/hooks/useNavigationMenuItemsData';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';

export type NewNavigationMenuItemInput = {
  type: NavigationMenuItemType;
  targetObjectMetadataId?: string | null;
  viewId?: string | null;
  targetRecordId?: string | null;
  targetRecordIdentifier?: NavigationMenuItem['targetRecordIdentifier'];
  name?: string | null;
  link?: string | null;
  color?: string | null;
};

type CreateItemOptions = {
  targetFolderId?: string | null;
  targetIndex?: number;
};

// The single create/update/delete API for the add/edit side panel. It forks on
// the active section (mirroring useHandleNavigationMenuItemDragAndDrop): the
// workspace section stages changes in the draft (saved on layout exit), while
// the favorite section persists personal items immediately and optimistically.
// On the immediate path the mutation hooks roll back on failure, so errors are
// surfaced here and the rejection is swallowed — callers fire-and-forget.
export const useNavigationMenuItemEditController = () => {
  const { t } = useLingui();
  const { enqueueErrorSnackBar } = useSnackBar();
  const navigationMenuItemEditSection = useAtomStateValue(
    navigationMenuItemEditSectionState,
  );
  const {
    navigationMenuItems,
    workspaceNavigationMenuItems,
    currentWorkspaceMemberId,
  } = useNavigationMenuItemsData();
  const setNavigationMenuItemsDraft = useSetAtomState(
    navigationMenuItemsDraftState,
  );
  const { createManyNavigationMenuItems } = useCreateManyNavigationMenuItems();
  const { updateManyNavigationMenuItems } = useUpdateManyNavigationMenuItems();
  const { deleteManyNavigationMenuItems } = useDeleteManyNavigationMenuItems();

  const isDraftMode = navigationMenuItemEditSection === 'workspace';
  const currentItems = isDraftMode
    ? workspaceNavigationMenuItems
    : navigationMenuItems;
  const targetUserWorkspaceId = isDraftMode
    ? undefined
    : currentWorkspaceMemberId;

  const createItem = (
    input: NewNavigationMenuItemInput,
    { targetFolderId, targetIndex }: CreateItemOptions = {},
  ): string => {
    const folderId = targetFolderId ?? null;
    const itemsInFolder = currentItems.filter(
      (item) => (item.folderId ?? null) === folderId,
    );
    const index = targetIndex ?? itemsInFolder.length;
    const { flatIndex, position } = computeInsertIndexAndPosition(
      currentItems,
      folderId,
      index,
    );

    const id = v4();
    const newItem: NavigationMenuItem = {
      __typename: 'NavigationMenuItem',
      id,
      type: input.type,
      position,
      userWorkspaceId: targetUserWorkspaceId,
      folderId: folderId ?? undefined,
      targetObjectMetadataId: input.targetObjectMetadataId ?? undefined,
      targetRecordId: input.targetRecordId ?? undefined,
      targetRecordIdentifier: input.targetRecordIdentifier,
      viewId: input.viewId ?? undefined,
      name: input.name ?? undefined,
      link: input.link ?? undefined,
      color: input.color ?? undefined,
      applicationId: undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (isDraftMode) {
      setNavigationMenuItemsDraft((draft) => {
        const current = draft ?? currentItems;
        return [
          ...current.slice(0, flatIndex),
          newItem,
          ...current.slice(flatIndex),
        ];
      });
      return id;
    }

    if (isDefined(targetUserWorkspaceId)) {
      void createManyNavigationMenuItems([
        {
          ...buildCreateNavigationMenuItemInput(newItem, (value) => value),
          userWorkspaceId: targetUserWorkspaceId,
        },
      ]).catch(() =>
        enqueueErrorSnackBar({ message: t`Couldn't add to favorites` }),
      );
    } else {
      enqueueErrorSnackBar({ message: t`Couldn't add to favorites` });
    }

    return id;
  };

  const updateItem = async (
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

  const deleteItems = async (ids: string[]): Promise<void> => {
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
    currentItems,
    isDraftMode,
    targetUserWorkspaceId,
    createItem,
    updateItem,
    deleteItems,
  };
};
