import { type NavigateAppToolOutput } from 'twenty-shared/ai';
import { isDefined } from 'twenty-shared/utils';

import { type ToolOutput } from 'src/engine/core-modules/tool/types/tool-output.type';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { type ViewDTO } from 'src/engine/metadata-modules/view/dtos/view.dto';
import { isViewVisibleToUser } from 'src/engine/metadata-modules/view/utils/is-view-visible-to-user.util';

export const buildNavigateToViewOutput = ({
  viewId,
  view,
  userWorkspaceId,
  flatObjectMetadataMaps,
}: {
  viewId: string;
  view:
    | Pick<
        ViewDTO,
        | 'id'
        | 'name'
        | 'objectMetadataId'
        | 'visibility'
        | 'createdByUserWorkspaceId'
      >
    | null
    | undefined;
  userWorkspaceId?: string;
  flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
}): ToolOutput<NavigateAppToolOutput> => {
  const flatObjectMetadata = isDefined(view)
    ? findFlatEntityByIdInFlatEntityMaps({
        flatEntityId: view.objectMetadataId,
        flatEntityMaps: flatObjectMetadataMaps,
      })
    : undefined;

  if (
    !isDefined(view) ||
    !isViewVisibleToUser(view, userWorkspaceId) ||
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
    message: `Navigating to view "${view.name}"`,
    result: {
      action: 'navigateToView',
      viewId: view.id,
      viewName: view.name,
      objectNameSingular: flatObjectMetadata.nameSingular,
    },
  };
};
