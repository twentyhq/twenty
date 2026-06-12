import { ensureAbsoluteUrl, isDefined } from 'twenty-shared/utils';
import {
  type NavigationMenuItem,
  type UpdateOneNavigationMenuItemInput,
} from '~/generated-metadata/graphql';

import { isNavigationMenuItemFolder } from '@/navigation-menu-item/common/utils/isNavigationMenuItemFolder';
import { isNavigationMenuItemLink } from '@/navigation-menu-item/common/utils/isNavigationMenuItemLink';

export const buildUpdateInputsFromDraft = ({
  draft,
  workspaceItemsById,
  idsToRecreateSet,
  resolveFolderId,
}: {
  draft: NavigationMenuItem[];
  workspaceItemsById: Map<string, NavigationMenuItem>;
  idsToRecreateSet: Set<string>;
  resolveFolderId: (draftFolderId: string) => string;
}): UpdateOneNavigationMenuItemInput[] => {
  const updateInputs = [];

  for (const draftItem of draft) {
    if (idsToRecreateSet.has(draftItem.id)) {
      continue;
    }

    const original = workspaceItemsById.get(draftItem.id);
    if (!original) {
      continue;
    }

    const positionChanged = original.position !== draftItem.position;
    const folderIdChanged =
      (original.folderId ?? null) !== (draftItem.folderId ?? null);
    const nameChanged =
      (isNavigationMenuItemFolder(draftItem) ||
        isNavigationMenuItemLink(draftItem)) &&
      (original.name ?? null) !== (draftItem.name ?? null);
    const linkChanged =
      isNavigationMenuItemLink(draftItem) &&
      (original.link ?? null) !== (draftItem.link ?? null);
    const iconChanged =
      isNavigationMenuItemFolder(draftItem) &&
      (original.icon ?? null) !== (draftItem.icon ?? null);
    const colorChanged =
      isNavigationMenuItemFolder(draftItem) &&
      (original.color ?? null) !== (draftItem.color ?? null);

    if (
      !positionChanged &&
      !folderIdChanged &&
      !nameChanged &&
      !linkChanged &&
      !iconChanged &&
      !colorChanged
    ) {
      continue;
    }

    const updatePayload: UpdateOneNavigationMenuItemInput['update'] = {};

    if (positionChanged) {
      updatePayload.position = draftItem.position;
    }
    if (folderIdChanged) {
      updatePayload.folderId = isDefined(draftItem.folderId)
        ? resolveFolderId(draftItem.folderId)
        : null;
    }
    if (nameChanged && isNavigationMenuItemFolder(draftItem)) {
      updatePayload.name = draftItem.name;
    }
    if (nameChanged && isNavigationMenuItemLink(draftItem)) {
      updatePayload.name = draftItem.name;
    }
    if (linkChanged && isNavigationMenuItemLink(draftItem)) {
      const linkUrl = (draftItem.link ?? '').trim();
      updatePayload.link = linkUrl ? ensureAbsoluteUrl(linkUrl) : null;
    }
    if (iconChanged && isNavigationMenuItemFolder(draftItem)) {
      updatePayload.icon = draftItem.icon ?? null;
    }
    if (colorChanged) {
      updatePayload.color = draftItem.color ?? null;
    }

    updateInputs.push({
      id: draftItem.id,
      update: updatePayload,
    });
  }

  return updateInputs;
};
