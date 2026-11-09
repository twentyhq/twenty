import { DEFAULT_VIEW_GROUP_LOAD_LIMIT } from 'twenty-shared/constants';
import {
  ViewOpenRecordIn,
  ViewType,
  ViewVisibility,
} from 'twenty-shared/types';

import {
  type ApplicationContentFlatEntityMaps,
  buildApplicationContentFromFlatEntityMaps,
} from 'src/engine/core-modules/application/application-content/utils/build-application-content-from-flat-entity-maps.util';
import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type SyncableFlatEntity } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-from.type';
import { addFlatEntityToFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/add-flat-entity-to-flat-entity-maps-or-throw.util';
import { type FlatViewField } from 'src/engine/metadata-modules/flat-view-field/types/flat-view-field.type';
import { type FlatView } from 'src/engine/metadata-modules/flat-view/types/flat-view.type';

const APPLICATION_ID = 'application-id';
const APPLICATION_UNIVERSAL_IDENTIFIER = 'application-universal-identifier';
const WORKSPACE_ID = 'workspace-id';
const OBJECT_METADATA_UNIVERSAL_IDENTIFIER = 'company';
const FIELD_METADATA_UNIVERSAL_IDENTIFIER = 'name';
const TIMESTAMP = '2026-09-22T00:00:00.000Z';

const BASE_FLAT_VIEW: FlatView = {
  id: 'view-id',
  universalIdentifier: 'view',
  workspaceId: WORKSPACE_ID,
  applicationId: APPLICATION_ID,
  applicationUniversalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
  objectMetadataId: 'object-metadata-id',
  name: 'Companies',
  icon: 'IconBuildingSkyscraper',
  type: ViewType.TABLE,
  key: null,
  position: 0,
  isCompact: false,
  openRecordIn: ViewOpenRecordIn.SIDE_PANEL,
  kanbanAggregateOperation: null,
  kanbanAggregateOperationFieldMetadataId: null,
  calendarLayout: null,
  calendarFieldMetadataId: null,
  calendarEndFieldMetadataId: null,
  mainGroupByFieldMetadataId: null,
  shouldHideEmptyGroups: false,
  shouldDisplayGroupsAsTabs: false,
  kanbanColumnWidth: null,
  groupLoadLimit: DEFAULT_VIEW_GROUP_LOAD_LIMIT,
  anyFieldFilterValue: null,
  visibility: ViewVisibility.WORKSPACE,
  isActive: true,
  isSystemSideEffect: false,
  createdByUserWorkspaceId: null,
  overrides: null,
  createdAt: TIMESTAMP,
  updatedAt: TIMESTAMP,
  deletedAt: null,
  viewFieldIds: [],
  viewFieldGroupIds: [],
  viewFilterIds: [],
  viewFilterGroupIds: [],
  viewSortIds: [],
  viewGroupIds: [],
  navigationMenuItemIds: [],
  viewFieldUniversalIdentifiers: [],
  viewFieldGroupUniversalIdentifiers: [],
  viewFilterUniversalIdentifiers: [],
  viewFilterGroupUniversalIdentifiers: [],
  viewSortUniversalIdentifiers: [],
  viewGroupUniversalIdentifiers: [],
  navigationMenuItemUniversalIdentifiers: [],
  objectMetadataUniversalIdentifier: OBJECT_METADATA_UNIVERSAL_IDENTIFIER,
  kanbanAggregateOperationFieldMetadataUniversalIdentifier: null,
  calendarFieldMetadataUniversalIdentifier: null,
  calendarEndFieldMetadataUniversalIdentifier: null,
  mainGroupByFieldMetadataUniversalIdentifier: null,
  universalOverrides: null,
};

const BASE_FLAT_VIEW_FIELD: FlatViewField = {
  id: 'view-field-id',
  universalIdentifier: 'view-field',
  workspaceId: WORKSPACE_ID,
  applicationId: APPLICATION_ID,
  applicationUniversalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
  fieldMetadataId: 'field-metadata-id',
  viewId: 'view-id',
  viewFieldGroupId: null,
  isVisible: true,
  size: 150,
  position: 0,
  aggregateOperation: null,
  isActive: true,
  isSystemSideEffect: false,
  overrides: null,
  createdAt: TIMESTAMP,
  updatedAt: TIMESTAMP,
  deletedAt: null,
  fieldMetadataUniversalIdentifier: FIELD_METADATA_UNIVERSAL_IDENTIFIER,
  viewUniversalIdentifier: 'view',
  viewFieldGroupUniversalIdentifier: null,
  universalOverrides: null,
};

const buildFlatEntityMaps = <TFlatEntity extends SyncableFlatEntity>(
  flatEntities: TFlatEntity[],
): FlatEntityMaps<TFlatEntity> =>
  flatEntities.reduce<FlatEntityMaps<TFlatEntity>>(
    (flatEntityMaps, flatEntity) =>
      addFlatEntityToFlatEntityMapsOrThrow({ flatEntity, flatEntityMaps }),
    createEmptyFlatEntityMaps(),
  );

const buildApplicationContentFlatEntityMaps = ({
  views,
  viewFields,
}: {
  views: FlatView[];
  viewFields: FlatViewField[];
}): ApplicationContentFlatEntityMaps => ({
  flatObjectMetadataMaps: createEmptyFlatEntityMaps(),
  flatFieldMetadataMaps: createEmptyFlatEntityMaps(),
  flatIndexMaps: createEmptyFlatEntityMaps(),
  flatViewMaps: buildFlatEntityMaps(views),
  flatViewFieldMaps: buildFlatEntityMaps(viewFields),
  flatPageLayoutMaps: createEmptyFlatEntityMaps(),
  flatPageLayoutTabMaps: createEmptyFlatEntityMaps(),
  flatPageLayoutWidgetMaps: createEmptyFlatEntityMaps(),
  flatNavigationMenuItemMaps: createEmptyFlatEntityMaps(),
  flatCommandMenuItemMaps: createEmptyFlatEntityMaps(),
  flatFrontComponentMaps: createEmptyFlatEntityMaps(),
  flatWorkflowMaps: createEmptyFlatEntityMaps(),
  flatWorkflowVersionMaps: createEmptyFlatEntityMaps(),
  flatLogicFunctionMaps: createEmptyFlatEntityMaps(),
  flatAgentMaps: createEmptyFlatEntityMaps(),
  flatSkillMaps: createEmptyFlatEntityMaps(),
  flatRoleMaps: createEmptyFlatEntityMaps(),
  flatRoleTargetMaps: createEmptyFlatEntityMaps(),
  flatPermissionFlagMaps: createEmptyFlatEntityMaps(),
  flatRolePermissionFlagMaps: createEmptyFlatEntityMaps(),
  flatConnectionProviderMaps: createEmptyFlatEntityMaps(),
});

describe('buildApplicationContentFromFlatEntityMaps', () => {
  it('should leave out personal views and their view fields', () => {
    const content = buildApplicationContentFromFlatEntityMaps({
      applicationId: APPLICATION_ID,
      flatEntityMaps: buildApplicationContentFlatEntityMaps({
        views: [
          {
            ...BASE_FLAT_VIEW,
            id: 'workspace-view-id',
            universalIdentifier: 'workspace-view',
          },
          {
            ...BASE_FLAT_VIEW,
            id: 'app-unlisted-view-id',
            universalIdentifier: 'app-unlisted-view',
            visibility: ViewVisibility.UNLISTED,
          },
          {
            ...BASE_FLAT_VIEW,
            id: 'personal-view-id',
            universalIdentifier: 'personal-view',
            visibility: ViewVisibility.UNLISTED,
            createdByUserWorkspaceId: 'user-workspace-id',
          },
        ],
        viewFields: [
          {
            ...BASE_FLAT_VIEW_FIELD,
            id: 'workspace-view-field-id',
            universalIdentifier: 'workspace-view-field',
            viewUniversalIdentifier: 'workspace-view',
          },
          {
            ...BASE_FLAT_VIEW_FIELD,
            id: 'personal-view-field-id',
            universalIdentifier: 'personal-view-field',
            viewUniversalIdentifier: 'personal-view',
          },
        ],
      }),
    });

    expect(content.views.map((view) => view.universalIdentifier)).toEqual([
      'workspace-view',
      'app-unlisted-view',
    ]);
    expect(
      content.viewFields.map((viewField) => viewField.universalIdentifier),
    ).toEqual(['workspace-view-field']);
  });

  it('should leave out soft-deleted entities', () => {
    const content = buildApplicationContentFromFlatEntityMaps({
      applicationId: APPLICATION_ID,
      flatEntityMaps: buildApplicationContentFlatEntityMaps({
        views: [
          {
            ...BASE_FLAT_VIEW,
            id: 'workspace-view-id',
            universalIdentifier: 'workspace-view',
          },
          {
            ...BASE_FLAT_VIEW,
            id: 'deleted-view-id',
            universalIdentifier: 'deleted-view',
            deletedAt: TIMESTAMP,
          },
        ],
        viewFields: [],
      }),
    });

    expect(content.views.map((view) => view.universalIdentifier)).toEqual([
      'workspace-view',
    ]);
  });
});
