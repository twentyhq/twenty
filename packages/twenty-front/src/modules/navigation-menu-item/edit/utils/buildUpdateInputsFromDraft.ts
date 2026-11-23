import { isDefined } from 'twenty-shared/utils';
import {
  type NavigationMenuItem,
  type UpdateOneNavigationMenuItemInput,
} from '~/generated-metadata/graphql';

import { getLinkNavigationMenuItemComputedLink } from '@/navigation-menu-item/common/utils/getLinkNavigationMenuItemComputedLink';
import { isNavigationMenuItemContainer } from '@/navigation-menu-item/common/utils/isNavigationMenuItemContainer';
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
    const parentIdChanged =
      (original.parentId ?? null) !== (draftItem.parentId ?? null);
    const isContainer = isNavigationMenuItemContainer(draftItem);
    const nameChanged =
      (isContainer || isNavigationMenuItemLink(draftItem)) &&
      (original.name ?? null) !== (draftItem.name ?? null);
    const linkChanged =
      isNavigationMenuItemLink(draftItem) &&
      (original.link ?? null) !== (draftItem.link ?? null);
    const iconChanged =
      isContainer && (original.icon ?? null) !== (draftItem.icon ?? null);
    const colorChanged =
      isNavigationMenuItemFolder(draftItem) &&
      (original.color ?? null) !== (draftItem.color ?? null);
    const isActiveChanged =
      (original.isActive !== false) !== (draftItem.isActive !== false);

    if (
      !positionChanged &&
      !parentIdChanged &&
      !nameChanged &&
      !linkChanged &&
      !iconChanged &&
      !colorChanged &&
      !isActiveChanged
    ) {
      continue;
    }

    const updatePayload: UpdateOneNavigationMenuItemInput['update'] = {};

    if (positionChanged) {
      updatePayload.position = draftItem.position;
    }
    if (parentIdChanged) {
      updatePayload.parentId = isDefined(draftItem.parentId)
        ? resolveFolderId(draftItem.parentId)
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
    if (isActiveChanged) {
      updatePayload.isActive = draftItem.isActive !== false;
    }

    updateInputs.push({
      id: draftItem.id,
      update: updatePayload,
    });
  }

  return updateInputs;
};
