import { ViewVisibility } from 'twenty-shared/types';

import { buildNavigateToViewOutput } from 'src/engine/core-modules/tool/tools/navigate-tool/utils/build-navigate-to-view-output.util';
import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { addFlatEntityToFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/add-flat-entity-to-flat-entity-maps-or-throw.util';
import { getFlatObjectMetadataMock } from 'src/engine/metadata-modules/flat-object-metadata/__mocks__/get-flat-object-metadata.mock';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';

const VIEW_ID = '20202020-0000-4000-8000-000000000002';
const CALLER_USER_WORKSPACE_ID = 'caller-user-workspace-id';
const OTHER_USER_WORKSPACE_ID = 'other-user-workspace-id';

const COMPANY_OBJECT = getFlatObjectMetadataMock({
  universalIdentifier: 'company-universal-identifier',
  id: 'company-object-id',
  nameSingular: 'company',
});

const EMPTY_FLAT_OBJECT_METADATA_MAPS: FlatEntityMaps<FlatObjectMetadata> =
  createEmptyFlatEntityMaps();

const FLAT_OBJECT_METADATA_MAPS = addFlatEntityToFlatEntityMapsOrThrow({
  flatEntity: COMPANY_OBJECT,
  flatEntityMaps: EMPTY_FLAT_OBJECT_METADATA_MAPS,
});

const buildView = ({
  visibility,
  createdByUserWorkspaceId = OTHER_USER_WORKSPACE_ID,
  objectMetadataId = COMPANY_OBJECT.id,
}: {
  visibility: ViewVisibility;
  createdByUserWorkspaceId?: string;
  objectMetadataId?: string;
}) => ({
  id: VIEW_ID,
  name: 'Key accounts',
  objectMetadataId,
  visibility,
  createdByUserWorkspaceId,
});

const NOT_FOUND_ERROR = `No view with id "${VIEW_ID}" was found, or you do not have access to it. Use get_views to list the views you can open.`;

describe('buildNavigateToViewOutput', () => {
  it('should return the view route for a workspace view', () => {
    const output = buildNavigateToViewOutput({
      viewId: VIEW_ID,
      view: buildView({ visibility: ViewVisibility.WORKSPACE }),
      userWorkspaceId: CALLER_USER_WORKSPACE_ID,
      flatObjectMetadataMaps: FLAT_OBJECT_METADATA_MAPS,
    });

    expect(output).toMatchObject({
      success: true,
      result: {
        action: 'navigateToView',
        viewId: VIEW_ID,
        viewName: 'Key accounts',
        objectNameSingular: 'company',
      },
    });
  });

  it('should return the view route for an unlisted view created by the caller', () => {
    const output = buildNavigateToViewOutput({
      viewId: VIEW_ID,
      view: buildView({
        visibility: ViewVisibility.UNLISTED,
        createdByUserWorkspaceId: CALLER_USER_WORKSPACE_ID,
      }),
      userWorkspaceId: CALLER_USER_WORKSPACE_ID,
      flatObjectMetadataMaps: FLAT_OBJECT_METADATA_MAPS,
    });

    expect(output.success).toBe(true);
  });

  it("should return not found for another user's unlisted view", () => {
    const output = buildNavigateToViewOutput({
      viewId: VIEW_ID,
      view: buildView({ visibility: ViewVisibility.UNLISTED }),
      userWorkspaceId: CALLER_USER_WORKSPACE_ID,
      flatObjectMetadataMaps: FLAT_OBJECT_METADATA_MAPS,
    });

    expect(output.success).toBe(false);
    expect(output.result).toBeUndefined();
    expect(output.error).toBe(NOT_FOUND_ERROR);
  });

  it('should return not found for an unlisted view when the caller has no user workspace', () => {
    const output = buildNavigateToViewOutput({
      viewId: VIEW_ID,
      view: buildView({ visibility: ViewVisibility.UNLISTED }),
      flatObjectMetadataMaps: FLAT_OBJECT_METADATA_MAPS,
    });

    expect(output.success).toBe(false);
  });

  it('should return not found for a missing view', () => {
    const output = buildNavigateToViewOutput({
      viewId: VIEW_ID,
      view: null,
      userWorkspaceId: CALLER_USER_WORKSPACE_ID,
      flatObjectMetadataMaps: FLAT_OBJECT_METADATA_MAPS,
    });

    expect(output.success).toBe(false);
    expect(output.error).toBe(NOT_FOUND_ERROR);
  });

  it('should return not found when the view object no longer exists', () => {
    const output = buildNavigateToViewOutput({
      viewId: VIEW_ID,
      view: buildView({
        visibility: ViewVisibility.WORKSPACE,
        objectMetadataId: 'deleted-object-id',
      }),
      userWorkspaceId: CALLER_USER_WORKSPACE_ID,
      flatObjectMetadataMaps: FLAT_OBJECT_METADATA_MAPS,
    });

    expect(output.success).toBe(false);
  });
});
