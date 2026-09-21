import { type FlatViewGroup } from '@/metadata-store/types/FlatViewGroup';
import { type UpdateViewMutation } from '~/generated-metadata/graphql';

type UpdatedViewGroup = UpdateViewMutation['updateView']['viewGroups'][number];

export const computeViewGroupsReplacementForView = ({
  viewId,
  existingViewGroups,
  updatedViewGroups,
}: {
  viewId: string;
  existingViewGroups: FlatViewGroup[];
  updatedViewGroups: UpdatedViewGroup[];
}): {
  viewGroupIdsToRemove: string[];
  viewGroupsToAdd: FlatViewGroup[];
} => {
  const updatedViewGroupIds = new Set(
    updatedViewGroups.map((viewGroup) => viewGroup.id),
  );

  const viewGroupIdsToRemove = existingViewGroups
    .filter(
      (viewGroup) =>
        viewGroup.viewId === viewId && !updatedViewGroupIds.has(viewGroup.id),
    )
    .map((viewGroup) => viewGroup.id);

  const viewGroupsToAdd = updatedViewGroups.map((viewGroup) => ({
    id: viewGroup.id,
    viewId: viewGroup.viewId,
    fieldValue: viewGroup.fieldValue,
    position: viewGroup.position,
    isVisible: viewGroup.isVisible,
  }));

  return { viewGroupIdsToRemove, viewGroupsToAdd };
};
