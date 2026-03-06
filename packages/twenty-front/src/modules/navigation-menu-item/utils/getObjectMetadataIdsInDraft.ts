import { isDefined } from 'twenty-shared/utils';

type NavigationMenuItemDraftForObjectIds = {
  viewId?: string | null;
  targetObjectMetadataId?: string | null;
};

type ViewForObjectIds = {
  id: string;
  objectMetadataId: string;
};

export const getObjectMetadataIdsInDraft = (
  draft: NavigationMenuItemDraftForObjectIds[],
  views: ViewForObjectIds[],
): Set<string> =>
  draft.reduce<Set<string>>((ids, item) => {
    const view = isDefined(item.viewId)
      ? views.find((view) => view.id === item.viewId)
      : undefined;
    if (isDefined(view)) {
      ids.add(view.objectMetadataId);
    }
    if (isDefined(item.targetObjectMetadataId)) {
      ids.add(item.targetObjectMetadataId);
    }
    return ids;
  }, new Set<string>());
