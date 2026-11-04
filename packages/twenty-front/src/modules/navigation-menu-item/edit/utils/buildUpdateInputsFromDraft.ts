import { isDefined } from 'twenty-shared/utils';
import {
  type NavigationMenuItem,
  type UpdateOneNavigationMenuItemInput,
} from '~/generated-metadata/graphql';

import { getLinkNavigationMenuItemComputedLink } from '@/navigation-menu-item/common/utils/getLinkNavigationMenuItemComputedLink';
import { isNavigationMenuItemAnySection } from '@/navigation-menu-item/common/utils/isNavigationMenuItemAnySection';
import { isNavigationMenuItemFolder } from '@/navigation-menu-item/common/utils/isNavigationMenuItemFolder';
import { isNavigationMenuItemLink } from '@/navigation-menu-item/common/utils/isNavigationMenuItemLink';
import { isNavigationMenuItemContainer } from '@/navigation-menu-item/common/utils/isNavigationMenuItemContainer';

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
    const isNamedContainer =
      isNavigationMenuItemFolder(draftItem) ||
      isNavigationMenuItemContainer(draftItem);
    const nameChanged =
      (isNamedContainer || isNavigationMenuItemLink(draftItem)) &&
      (original.name ?? null) !== (draftItem.name ?? null);
    const linkChanged =
      isNavigationMenuItemLink(draftItem) &&
      (original.link ?? null) !== (draftItem.link ?? null);
    const iconChanged =
      isNamedContainer && (original.icon ?? null) !== (draftItem.icon ?? null);
    const colorChanged =
      isNavigationMenuItemFolder(draftItem) &&
      (original.color ?? null) !== (draftItem.color ?? null);
    const visibleItemLimitChanged =
      isNavigationMenuItemAnySection(draftItem) &&
      (original.visibleItemLimit ?? null) !==
        (draftItem.visibleItemLimit ?? null);

    if (
      !positionChanged &&
      !folderIdChanged &&
      !nameChanged &&
      !linkChanged &&
      !iconChanged &&
      !colorChanged &&
      !visibleItemLimitChanged
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
    if (nameChanged) {
      updatePayload.name = draftItem.name;
    }
    if (linkChanged && isNavigationMenuItemLink(draftItem)) {
      const linkUrl = (draftItem.link ?? '').trim();
      updatePayload.link = linkUrl
        ? getLinkNavigationMenuItemComputedLink({ link: linkUrl })
        : null;
    }
    if (iconChanged) {
      updatePayload.icon = draftItem.icon ?? null;
    }
    if (colorChanged) {
      updatePayload.color = draftItem.color ?? null;
    }
    if (visibleItemLimitChanged) {
      updatePayload.visibleItemLimit = draftItem.visibleItemLimit ?? null;
    }

    updateInputs.push({
      id: draftItem.id,
      update: updatePayload,
    });
  }

  return updateInputs;
};
