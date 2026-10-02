import { type NavigateAppToolOutput } from 'twenty-shared/ai';
import { isDefined } from 'twenty-shared/utils';

import { type ToolOutput } from 'src/engine/core-modules/tool/types/tool-output.type';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { type FlatView } from 'src/engine/metadata-modules/flat-view/types/flat-view.type';
import { isViewAvailableToUser } from 'src/engine/metadata-modules/view/utils/is-view-available-to-user.util';

export const buildNavigateToViewOutput = ({
  viewId,
  flatView,
  userWorkspaceId,
  isInitialObjectViewEnabled,
  flatObjectMetadataMaps,
}: {
  viewId: string;
  flatView:
    | Pick<
        FlatView,
        | 'id'
        | 'name'
        | 'objectMetadataId'
        | 'deletedAt'
        | 'visibility'
        | 'createdByUserWorkspaceId'
        | 'universalIdentifier'
        | 'applicationUniversalIdentifier'
        | 'objectMetadataUniversalIdentifier'
      >
    | undefined;
  userWorkspaceId?: string;
  isInitialObjectViewEnabled: boolean;
  flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
}): ToolOutput<NavigateAppToolOutput> => {
  const flatObjectMetadata = isDefined(flatView)
    ? findFlatEntityByIdInFlatEntityMaps({
        flatEntityId: flatView.objectMetadataId,
        flatEntityMaps: flatObjectMetadataMaps,
      })
    : undefined;

  if (
    !isDefined(flatView) ||
    !isViewAvailableToUser({
      flatView,
      userWorkspaceId,
      isInitialObjectViewEnabled,
    }) ||
    !isDefined(flatObjectMetadata)
  ) {
    return {
      success: false,
      message: 'View not found',
      error: `No view with id "${viewId}" was found, or you do not have access to it. Use get_views to list the views you can open.`,
    };
  }

  return {
    success: true,
    message: `Navigating to view "${flatView.name}"`,
    result: {
      action: 'navigateToView',
      viewId: flatView.id,
      viewName: flatView.name,
      objectNameSingular: flatObjectMetadata.nameSingular,
    },
  };
};
