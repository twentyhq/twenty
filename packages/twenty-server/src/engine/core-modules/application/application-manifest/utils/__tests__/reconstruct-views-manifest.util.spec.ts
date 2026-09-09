import {
  TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER,
  type ViewFieldGroupManifest,
  type ViewFieldManifest,
  type ViewFilterGroupManifest,
  type ViewFilterManifest,
  type ViewGroupManifest,
  type ViewManifest,
  type ViewSortManifest,
} from 'twenty-shared/application';
import {
  AggregateOperations,
  FieldMetadataType,
  ViewFilterGroupLogicalOperator,
  ViewFilterOperand,
  ViewKey,
  ViewOpenRecordIn,
  ViewSortDirection,
  ViewType,
  ViewVisibility,
} from 'twenty-shared/types';

import { fromViewFieldGroupManifestToUniversalFlatViewFieldGroup } from 'src/engine/core-modules/application/application-manifest/converters/from-view-field-group-manifest-to-universal-flat-view-field-group.util';
import { fromViewFieldManifestToUniversalFlatViewField } from 'src/engine/core-modules/application/application-manifest/converters/from-view-field-manifest-to-universal-flat-view-field.util';
import { fromViewFilterGroupManifestToUniversalFlatViewFilterGroup } from 'src/engine/core-modules/application/application-manifest/converters/from-view-filter-group-manifest-to-universal-flat-view-filter-group.util';
import { fromViewFilterManifestToUniversalFlatViewFilter } from 'src/engine/core-modules/application/application-manifest/converters/from-view-filter-manifest-to-universal-flat-view-filter.util';
import { fromViewGroupManifestToUniversalFlatViewGroup } from 'src/engine/core-modules/application/application-manifest/converters/from-view-group-manifest-to-universal-flat-view-group.util';
import { fromViewManifestToUniversalFlatView } from 'src/engine/core-modules/application/application-manifest/converters/from-view-manifest-to-universal-flat-view.util';
import { fromViewSortManifestToUniversalFlatViewSort } from 'src/engine/core-modules/application/application-manifest/converters/from-view-sort-manifest-to-universal-flat-view-sort.util';
import { reconstructViewsManifest } from 'src/engine/core-modules/application/application-manifest/utils/reconstruct-views-manifest.util';
import { ApplicationExportCoverageStatus } from 'src/engine/core-modules/application/enums/application-export-coverage-status.enum';
import { createEmptyAllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-all-flat-entity-maps.constant';
import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { addAllFlatEntitiesToFlatEntityMaps } from 'src/engine/core-modules/application/application-manifest/utils/__tests__/add-all-flat-entities-to-flat-entity-maps.test-util';
import { getFlatFieldMetadataMock } from 'src/engine/metadata-modules/flat-field-metadata/__mocks__/get-flat-field-metadata.mock';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { getFlatObjectMetadataMock } from 'src/engine/metadata-modules/flat-object-metadata/__mocks__/get-flat-object-metadata.mock';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { type FlatViewFieldGroup } from 'src/engine/metadata-modules/flat-view-field-group/types/flat-view-field-group.type';
import { type FlatViewField } from 'src/engine/metadata-modules/flat-view-field/types/flat-view-field.type';
import { type FlatViewFilterGroup } from 'src/engine/metadata-modules/flat-view-filter-group/types/flat-view-filter-group.type';
import { type FlatViewFilter } from 'src/engine/metadata-modules/flat-view-filter/types/flat-view-filter.type';
import { type FlatViewGroup } from 'src/engine/metadata-modules/flat-view-group/types/flat-view-group.type';
import { type FlatViewSort } from 'src/engine/metadata-modules/flat-view-sort/types/flat-view-sort.type';
import { type FlatView } from 'src/engine/metadata-modules/flat-view/types/flat-view.type';

const APP_ID = 'application-id';
const WORKSPACE_ID = 'workspace-id';
const NOW = '2026-09-03T10:00:00.000Z';
const APP_UID = '11111111-1111-4111-8111-111111111111';
const PET_UID = '22222222-2222-4222-8222-222222222222';
const NAME_FIELD_UID = '33333333-3333-4333-8333-333333333333';
const SPECIES_FIELD_UID = '44444444-4444-4444-8444-444444444444';
const AGE_FIELD_UID = '55555555-5555-4555-8555-555555555555';
const COMPANY_UID = '66666666-6666-4666-8666-666666666666';
const MISSING_FIELD_UID = '77777777-7777-4777-8777-777777777777';
const ZOO_PETS_VIEW_UID = '88888888-8888-4888-8888-888888888888';
const ALL_PETS_VIEW_UID = '99999999-9999-4999-8999-999999999999';
const INDEX_VIEW_UID = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
const COMPANIES_VIEW_UID = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
const PEOPLE_VIEW_UID = 'cccccccc-cccc-4ccc-8ccc-cccccccccccc';
const NAMELESS_VIEW_UID = 'dddddddd-dddd-4ddd-8ddd-dddddddddddd';
const PET_OWNERS_VIEW_UID = 'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee';
const OTHER_ALL_PETS_VIEW_UID = '00000000-0000-4000-8000-000000000000';
const STANDARD_APP_ID = 'standard-application-id';
const EXPORTED_OBJECT_UNIVERSAL_IDENTIFIERS = new Set([PET_UID]);

const buildMaps = ({
  objects = [],
  fields = [],
  views = [],
  viewFields = [],
  viewFieldGroups = [],
  viewFilters = [],
  viewFilterGroups = [],
  viewGroups = [],
  viewSorts = [],
}: {
  objects?: FlatObjectMetadata[];
  fields?: FlatFieldMetadata[];
  views?: FlatView[];
  viewFields?: FlatViewField[];
  viewFieldGroups?: FlatViewFieldGroup[];
  viewFilters?: FlatViewFilter[];
  viewFilterGroups?: FlatViewFilterGroup[];
  viewGroups?: FlatViewGroup[];
  viewSorts?: FlatViewSort[];
}): AllFlatEntityMaps => {
  const maps = createEmptyAllFlatEntityMaps();

  return {
    ...maps,
    flatObjectMetadataMaps: addAllFlatEntitiesToFlatEntityMaps({
      flatEntities: objects,
      flatEntityMaps: maps.flatObjectMetadataMaps,
    }),
    flatFieldMetadataMaps: addAllFlatEntitiesToFlatEntityMaps({
      flatEntities: fields,
      flatEntityMaps: maps.flatFieldMetadataMaps,
    }),
    flatViewMaps: addAllFlatEntitiesToFlatEntityMaps({
      flatEntities: views,
      flatEntityMaps: maps.flatViewMaps,
    }),
    flatViewFieldMaps: addAllFlatEntitiesToFlatEntityMaps({
      flatEntities: viewFields,
      flatEntityMaps: maps.flatViewFieldMaps,
    }),
    flatViewFieldGroupMaps: addAllFlatEntitiesToFlatEntityMaps({
      flatEntities: viewFieldGroups,
      flatEntityMaps: maps.flatViewFieldGroupMaps,
    }),
    flatViewFilterMaps: addAllFlatEntitiesToFlatEntityMaps({
      flatEntities: viewFilters,
      flatEntityMaps: maps.flatViewFilterMaps,
    }),
    flatViewFilterGroupMaps: addAllFlatEntitiesToFlatEntityMaps({
      flatEntities: viewFilterGroups,
      flatEntityMaps: maps.flatViewFilterGroupMaps,
    }),
    flatViewGroupMaps: addAllFlatEntitiesToFlatEntityMaps({
      flatEntities: viewGroups,
      flatEntityMaps: maps.flatViewGroupMaps,
    }),
    flatViewSortMaps: addAllFlatEntitiesToFlatEntityMaps({
      flatEntities: viewSorts,
      flatEntityMaps: maps.flatViewSortMaps,
    }),
  };
};

const petObject = getFlatObjectMetadataMock({
  universalIdentifier: PET_UID,
  applicationId: APP_ID,
  applicationUniversalIdentifier: APP_UID,
  nameSingular: 'pet',
  namePlural: 'pets',
  labelIdentifierFieldMetadataUniversalIdentifier: NAME_FIELD_UID,
});

const buildPetField = ({
  universalIdentifier,
  name,
}: {
  universalIdentifier: string;
  name: string;
}) =>
  getFlatFieldMetadataMock({
    universalIdentifier,
    name,
    objectMetadataId: petObject.id,
    objectMetadataUniversalIdentifier: PET_UID,
    applicationId: APP_ID,
    applicationUniversalIdentifier: APP_UID,
    type: FieldMetadataType.TEXT,
  });

const companyObject = getFlatObjectMetadataMock({
  universalIdentifier: COMPANY_UID,
  applicationId: STANDARD_APP_ID,
  applicationUniversalIdentifier:
    TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER,
  nameSingular: 'company',
  namePlural: 'companies',
});

const allFlatEntityMaps = buildMaps({
  objects: [petObject, companyObject],
  fields: [
    buildPetField({ universalIdentifier: NAME_FIELD_UID, name: 'name' }),
    buildPetField({ universalIdentifier: SPECIES_FIELD_UID, name: 'species' }),
    buildPetField({ universalIdentifier: AGE_FIELD_UID, name: 'age' }),
  ],
});

const buildFlatView = ({
  viewManifest,
  ...flatViewProperties
}: { viewManifest: ViewManifest } & Partial<FlatView>): FlatView => ({
  ...fromViewManifestToUniversalFlatView({
    viewManifest,
    applicationUniversalIdentifier: APP_UID,
    now: NOW,
  }),
  id: `${viewManifest.universalIdentifier}-id`,
  workspaceId: WORKSPACE_ID,
  applicationId: APP_ID,
  objectMetadataId: `${viewManifest.objectUniversalIdentifier}-id`,
  kanbanAggregateOperationFieldMetadataId: null,
  calendarFieldMetadataId: null,
  calendarEndFieldMetadataId: null,
  mainGroupByFieldMetadataId: null,
  overrides: null,
  viewFieldIds: [],
  viewFieldGroupIds: [],
  viewFilterIds: [],
  viewGroupIds: [],
  viewFilterGroupIds: [],
  viewSortIds: [],
  ...flatViewProperties,
});

const buildFlatViewField = ({
  viewFieldManifest,
  viewUniversalIdentifier,
  ...flatViewFieldProperties
}: {
  viewFieldManifest: ViewFieldManifest;
  viewUniversalIdentifier: string;
} & Partial<FlatViewField>): FlatViewField => ({
  ...fromViewFieldManifestToUniversalFlatViewField({
    viewFieldManifest,
    viewUniversalIdentifier,
    applicationUniversalIdentifier: APP_UID,
    now: NOW,
  }),
  id: `${viewFieldManifest.universalIdentifier}-id`,
  workspaceId: WORKSPACE_ID,
  applicationId: APP_ID,
  fieldMetadataId: `${viewFieldManifest.fieldMetadataUniversalIdentifier}-id`,
  viewId: `${viewUniversalIdentifier}-id`,
  viewFieldGroupId: null,
  overrides: null,
  ...flatViewFieldProperties,
});

const buildFlatViewFieldGroup = ({
  viewFieldGroupManifest,
  viewUniversalIdentifier,
  ...flatViewFieldGroupProperties
}: {
  viewFieldGroupManifest: ViewFieldGroupManifest;
  viewUniversalIdentifier: string;
} & Partial<FlatViewFieldGroup>): FlatViewFieldGroup => ({
  ...fromViewFieldGroupManifestToUniversalFlatViewFieldGroup({
    viewFieldGroupManifest,
    viewUniversalIdentifier,
    applicationUniversalIdentifier: APP_UID,
    now: NOW,
  }),
  id: `${viewFieldGroupManifest.universalIdentifier}-id`,
  workspaceId: WORKSPACE_ID,
  applicationId: APP_ID,
  viewId: `${viewUniversalIdentifier}-id`,
  viewFieldIds: [],
  ...flatViewFieldGroupProperties,
});

const buildFlatViewFilter = ({
  viewFilterManifest,
  viewUniversalIdentifier,
  ...flatViewFilterProperties
}: {
  viewFilterManifest: ViewFilterManifest;
  viewUniversalIdentifier: string;
} & Partial<FlatViewFilter>): FlatViewFilter => ({
  ...fromViewFilterManifestToUniversalFlatViewFilter({
    viewFilterManifest,
    viewUniversalIdentifier,
    applicationUniversalIdentifier: APP_UID,
    now: NOW,
  }),
  id: `${viewFilterManifest.universalIdentifier}-id`,
  workspaceId: WORKSPACE_ID,
  applicationId: APP_ID,
  fieldMetadataId: `${viewFilterManifest.fieldMetadataUniversalIdentifier}-id`,
  viewId: `${viewUniversalIdentifier}-id`,
  viewFilterGroupId: null,
  relationTargetFieldMetadataId: null,
  ...flatViewFilterProperties,
});

const buildFlatViewFilterGroup = ({
  viewFilterGroupManifest,
  viewUniversalIdentifier,
}: {
  viewFilterGroupManifest: ViewFilterGroupManifest;
  viewUniversalIdentifier: string;
}): FlatViewFilterGroup => ({
  ...fromViewFilterGroupManifestToUniversalFlatViewFilterGroup({
    viewFilterGroupManifest,
    viewUniversalIdentifier,
    applicationUniversalIdentifier: APP_UID,
    now: NOW,
  }),
  id: `${viewFilterGroupManifest.universalIdentifier}-id`,
  workspaceId: WORKSPACE_ID,
  applicationId: APP_ID,
  viewId: `${viewUniversalIdentifier}-id`,
  parentViewFilterGroupId: null,
  viewFilterIds: [],
  childViewFilterGroupIds: [],
});

const buildFlatViewGroup = ({
  viewGroupManifest,
  viewUniversalIdentifier,
}: {
  viewGroupManifest: ViewGroupManifest;
  viewUniversalIdentifier: string;
}): FlatViewGroup => ({
  ...fromViewGroupManifestToUniversalFlatViewGroup({
    viewGroupManifest,
    viewUniversalIdentifier,
    applicationUniversalIdentifier: APP_UID,
    now: NOW,
  }),
  id: `${viewGroupManifest.universalIdentifier}-id`,
  workspaceId: WORKSPACE_ID,
  applicationId: APP_ID,
  viewId: `${viewUniversalIdentifier}-id`,
});

const buildFlatViewSort = ({
  viewSortManifest,
  viewUniversalIdentifier,
}: {
  viewSortManifest: ViewSortManifest;
  viewUniversalIdentifier: string;
}): FlatViewSort => ({
  ...fromViewSortManifestToUniversalFlatViewSort({
    viewSortManifest,
    viewUniversalIdentifier,
    applicationUniversalIdentifier: APP_UID,
    now: NOW,
  }),
  id: `${viewSortManifest.universalIdentifier}-id`,
  workspaceId: WORKSPACE_ID,
  applicationId: APP_ID,
  fieldMetadataId: `${viewSortManifest.fieldMetadataUniversalIdentifier}-id`,
  viewId: `${viewUniversalIdentifier}-id`,
});

const ALL_PETS_VIEW_MANIFEST: ViewManifest = {
  universalIdentifier: ALL_PETS_VIEW_UID,
  name: 'All pets',
  objectUniversalIdentifier: PET_UID,
  type: ViewType.TABLE,
  icon: 'IconPaw',
  position: 0,
  isCompact: false,
  visibility: ViewVisibility.WORKSPACE,
  openRecordIn: ViewOpenRecordIn.SIDE_PANEL,
  shouldHideEmptyGroups: false,
};

const ZOO_PETS_VIEW_MANIFEST: ViewManifest = {
  universalIdentifier: ZOO_PETS_VIEW_UID,
  name: 'Zoo pets',
  objectUniversalIdentifier: PET_UID,
  type: ViewType.KANBAN,
  icon: 'IconLayoutKanban',
  position: 1,
  isCompact: true,
  visibility: ViewVisibility.WORKSPACE,
  openRecordIn: ViewOpenRecordIn.RECORD_PAGE,
  shouldHideEmptyGroups: true,
  mainGroupByFieldMetadataUniversalIdentifier: SPECIES_FIELD_UID,
};

const OTHER_ALL_PETS_VIEW_MANIFEST: ViewManifest = {
  ...ALL_PETS_VIEW_MANIFEST,
  universalIdentifier: OTHER_ALL_PETS_VIEW_UID,
  icon: 'IconDog',
};

const INDEX_VIEW_MANIFEST: ViewManifest = {
  universalIdentifier: INDEX_VIEW_UID,
  name: 'All',
  objectUniversalIdentifier: PET_UID,
};

const NAME_VIEW_FIELD_MANIFEST: ViewFieldManifest = {
  universalIdentifier: 'name-view-field',
  fieldMetadataUniversalIdentifier: NAME_FIELD_UID,
  position: 0,
  isVisible: true,
  size: 210,
  viewFieldGroupUniversalIdentifier: 'details-view-field-group',
};

const AGE_VIEW_FIELD_MANIFEST: ViewFieldManifest = {
  universalIdentifier: 'age-view-field',
  fieldMetadataUniversalIdentifier: AGE_FIELD_UID,
  position: 1,
  isVisible: false,
  size: 100,
  aggregateOperation: AggregateOperations.AVG,
};

const SPECIES_VIEW_FIELD_MANIFEST: ViewFieldManifest = {
  universalIdentifier: 'species-view-field',
  fieldMetadataUniversalIdentifier: SPECIES_FIELD_UID,
  position: 1,
  isVisible: true,
  size: 150,
};

const CUSTOM_AGE_VIEW_FIELD_MANIFEST: ViewFieldManifest = {
  universalIdentifier: 'custom-age-view-field',
  fieldMetadataUniversalIdentifier: AGE_FIELD_UID,
  position: 1,
  isVisible: true,
  size: 100,
};

const NAME_FILTER_MANIFEST: ViewFilterManifest = {
  universalIdentifier: 'name-view-filter',
  fieldMetadataUniversalIdentifier: NAME_FIELD_UID,
  operand: ViewFilterOperand.CONTAINS,
  value: 'Rex',
  viewFilterGroupUniversalIdentifier: 'root-view-filter-group',
  positionInViewFilterGroup: 0,
};

const AGE_FILTER_MANIFEST: ViewFilterManifest = {
  universalIdentifier: 'age-view-filter',
  fieldMetadataUniversalIdentifier: AGE_FIELD_UID,
  operand: ViewFilterOperand.GREATER_THAN_OR_EQUAL,
  value: 5,
  viewFilterGroupUniversalIdentifier: 'root-view-filter-group',
  positionInViewFilterGroup: 1,
};

const ROOT_FILTER_GROUP_MANIFEST: ViewFilterGroupManifest = {
  universalIdentifier: 'root-view-filter-group',
  logicalOperator: ViewFilterGroupLogicalOperator.AND,
};

const DOG_GROUP_MANIFEST: ViewGroupManifest = {
  universalIdentifier: 'dog-view-group',
  fieldValue: 'DOG',
  position: 0,
  isVisible: true,
};

const DETAILS_FIELD_GROUP_MANIFEST: ViewFieldGroupManifest = {
  universalIdentifier: 'details-view-field-group',
  name: 'Details',
  position: 0,
  isVisible: true,
};

const NAME_SORT_MANIFEST: ViewSortManifest = {
  universalIdentifier: 'name-view-sort',
  fieldMetadataUniversalIdentifier: NAME_FIELD_UID,
  direction: ViewSortDirection.ASC,
};

const AGE_SORT_MANIFEST: ViewSortManifest = {
  universalIdentifier: 'age-view-sort',
  fieldMetadataUniversalIdentifier: AGE_FIELD_UID,
  direction: ViewSortDirection.DESC,
};

const statusOf = (
  coverage: ReturnType<typeof reconstructViewsManifest>['coverage'],
  universalIdentifier: string,
) =>
  coverage.find((entry) => entry.universalIdentifier === universalIdentifier);

describe('reconstructViewsManifest', () => {
  it('should nest the children of an application view and order every collection by universal identifier', () => {
    const { views, viewFields, coverage } = reconstructViewsManifest({
      applicationAllFlatEntityMaps: buildMaps({
        objects: [petObject],
        views: [
          buildFlatView({ viewManifest: ZOO_PETS_VIEW_MANIFEST }),
          buildFlatView({ viewManifest: ALL_PETS_VIEW_MANIFEST }),
          buildFlatView({ viewManifest: OTHER_ALL_PETS_VIEW_MANIFEST }),
        ],
        viewFields: [
          buildFlatViewField({
            viewFieldManifest: SPECIES_VIEW_FIELD_MANIFEST,
            viewUniversalIdentifier: ALL_PETS_VIEW_UID,
          }),
          buildFlatViewField({
            viewFieldManifest: AGE_VIEW_FIELD_MANIFEST,
            viewUniversalIdentifier: ALL_PETS_VIEW_UID,
          }),
          buildFlatViewField({
            viewFieldManifest: NAME_VIEW_FIELD_MANIFEST,
            viewUniversalIdentifier: ALL_PETS_VIEW_UID,
          }),
        ],
        viewFilters: [
          buildFlatViewFilter({
            viewFilterManifest: AGE_FILTER_MANIFEST,
            viewUniversalIdentifier: ALL_PETS_VIEW_UID,
          }),
          buildFlatViewFilter({
            viewFilterManifest: NAME_FILTER_MANIFEST,
            viewUniversalIdentifier: ALL_PETS_VIEW_UID,
          }),
        ],
        viewFilterGroups: [
          buildFlatViewFilterGroup({
            viewFilterGroupManifest: ROOT_FILTER_GROUP_MANIFEST,
            viewUniversalIdentifier: ALL_PETS_VIEW_UID,
          }),
        ],
        viewGroups: [
          buildFlatViewGroup({
            viewGroupManifest: DOG_GROUP_MANIFEST,
            viewUniversalIdentifier: ALL_PETS_VIEW_UID,
          }),
        ],
        viewFieldGroups: [
          buildFlatViewFieldGroup({
            viewFieldGroupManifest: DETAILS_FIELD_GROUP_MANIFEST,
            viewUniversalIdentifier: ALL_PETS_VIEW_UID,
          }),
        ],
        viewSorts: [
          buildFlatViewSort({
            viewSortManifest: AGE_SORT_MANIFEST,
            viewUniversalIdentifier: ALL_PETS_VIEW_UID,
          }),
          buildFlatViewSort({
            viewSortManifest: NAME_SORT_MANIFEST,
            viewUniversalIdentifier: ALL_PETS_VIEW_UID,
          }),
        ],
      }),
      allFlatEntityMaps,
      exportedObjectUniversalIdentifiers: EXPORTED_OBJECT_UNIVERSAL_IDENTIFIERS,
    });

    expect(views).toEqual([
      OTHER_ALL_PETS_VIEW_MANIFEST,
      ZOO_PETS_VIEW_MANIFEST,
      {
        ...ALL_PETS_VIEW_MANIFEST,
        fields: [
          AGE_VIEW_FIELD_MANIFEST,
          NAME_VIEW_FIELD_MANIFEST,
          SPECIES_VIEW_FIELD_MANIFEST,
        ],
        filters: [AGE_FILTER_MANIFEST, NAME_FILTER_MANIFEST],
        filterGroups: [ROOT_FILTER_GROUP_MANIFEST],
        groups: [DOG_GROUP_MANIFEST],
        fieldGroups: [DETAILS_FIELD_GROUP_MANIFEST],
        sorts: [AGE_SORT_MANIFEST, NAME_SORT_MANIFEST],
      },
    ]);
    expect(viewFields).toEqual([]);
    expect(coverage).toHaveLength(13);
    expect(
      coverage.filter(
        ({ status }) => status !== ApplicationExportCoverageStatus.EXPORTED,
      ),
    ).toEqual([]);
    expect(statusOf(coverage, 'name-view-filter')).toEqual({
      metadataName: 'viewFilter',
      universalIdentifier: 'name-view-filter',
      status: ApplicationExportCoverageStatus.EXPORTED,
    });
  });

  it('should hide an engine-derived view and its flagged children but export its unflagged view field standalone', () => {
    const { views, viewFields, coverage } = reconstructViewsManifest({
      applicationAllFlatEntityMaps: buildMaps({
        objects: [petObject],
        views: [
          buildFlatView({
            viewManifest: INDEX_VIEW_MANIFEST,
            key: ViewKey.INDEX,
            isSystemSideEffect: true,
          }),
        ],
        viewFields: [
          buildFlatViewField({
            viewFieldManifest: {
              universalIdentifier: 'engine-name-view-field',
              fieldMetadataUniversalIdentifier: NAME_FIELD_UID,
              position: 0,
            },
            viewUniversalIdentifier: INDEX_VIEW_UID,
            isSystemSideEffect: true,
          }),
          buildFlatViewField({
            viewFieldManifest: CUSTOM_AGE_VIEW_FIELD_MANIFEST,
            viewUniversalIdentifier: INDEX_VIEW_UID,
          }),
        ],
        viewFieldGroups: [
          buildFlatViewFieldGroup({
            viewFieldGroupManifest: {
              universalIdentifier: 'engine-view-field-group',
              position: 0,
            },
            viewUniversalIdentifier: INDEX_VIEW_UID,
            isSystemSideEffect: true,
          }),
        ],
      }),
      allFlatEntityMaps,
      exportedObjectUniversalIdentifiers: EXPORTED_OBJECT_UNIVERSAL_IDENTIFIERS,
    });

    expect(views).toEqual([]);
    expect(viewFields).toEqual([
      {
        ...CUSTOM_AGE_VIEW_FIELD_MANIFEST,
        viewUniversalIdentifier: INDEX_VIEW_UID,
      },
    ]);
    expect(statusOf(coverage, INDEX_VIEW_UID)).toEqual({
      metadataName: 'view',
      universalIdentifier: INDEX_VIEW_UID,
      status: ApplicationExportCoverageStatus.ENGINE_DERIVED,
    });
    expect(statusOf(coverage, 'engine-name-view-field')).toEqual({
      metadataName: 'viewField',
      universalIdentifier: 'engine-name-view-field',
      status: ApplicationExportCoverageStatus.ENGINE_DERIVED,
    });
    expect(statusOf(coverage, 'engine-view-field-group')).toEqual({
      metadataName: 'viewFieldGroup',
      universalIdentifier: 'engine-view-field-group',
      status: ApplicationExportCoverageStatus.ENGINE_DERIVED,
    });
    expect(statusOf(coverage, 'custom-age-view-field')).toEqual({
      metadataName: 'viewField',
      universalIdentifier: 'custom-age-view-field',
      status: ApplicationExportCoverageStatus.EXPORTED,
    });
  });

  it('should export a view field of a view outside the application standalone but refuse the other children of foreign and engine-derived views', () => {
    const { views, viewFields, coverage } = reconstructViewsManifest({
      applicationAllFlatEntityMaps: buildMaps({
        objects: [petObject],
        views: [
          buildFlatView({
            viewManifest: INDEX_VIEW_MANIFEST,
            isSystemSideEffect: true,
          }),
        ],
        viewFields: [
          buildFlatViewField({
            viewFieldManifest: CUSTOM_AGE_VIEW_FIELD_MANIFEST,
            viewUniversalIdentifier: COMPANIES_VIEW_UID,
          }),
        ],
        viewFilters: [
          buildFlatViewFilter({
            viewFilterManifest: {
              ...NAME_FILTER_MANIFEST,
              universalIdentifier: 'foreign-view-filter',
            },
            viewUniversalIdentifier: COMPANIES_VIEW_UID,
          }),
          buildFlatViewFilter({
            viewFilterManifest: {
              ...NAME_FILTER_MANIFEST,
              universalIdentifier: 'engine-view-filter',
            },
            viewUniversalIdentifier: INDEX_VIEW_UID,
          }),
        ],
        viewFilterGroups: [
          buildFlatViewFilterGroup({
            viewFilterGroupManifest: {
              ...ROOT_FILTER_GROUP_MANIFEST,
              universalIdentifier: 'foreign-view-filter-group',
            },
            viewUniversalIdentifier: COMPANIES_VIEW_UID,
          }),
        ],
        viewSorts: [
          buildFlatViewSort({
            viewSortManifest: {
              ...NAME_SORT_MANIFEST,
              universalIdentifier: 'foreign-view-sort',
            },
            viewUniversalIdentifier: COMPANIES_VIEW_UID,
          }),
        ],
        viewGroups: [
          buildFlatViewGroup({
            viewGroupManifest: {
              ...DOG_GROUP_MANIFEST,
              universalIdentifier: 'foreign-view-group',
            },
            viewUniversalIdentifier: COMPANIES_VIEW_UID,
          }),
        ],
        viewFieldGroups: [
          buildFlatViewFieldGroup({
            viewFieldGroupManifest: {
              ...DETAILS_FIELD_GROUP_MANIFEST,
              universalIdentifier: 'foreign-view-field-group',
            },
            viewUniversalIdentifier: COMPANIES_VIEW_UID,
          }),
        ],
      }),
      allFlatEntityMaps,
      exportedObjectUniversalIdentifiers: EXPORTED_OBJECT_UNIVERSAL_IDENTIFIERS,
    });

    expect(views).toEqual([]);
    expect(viewFields).toEqual([
      {
        ...CUSTOM_AGE_VIEW_FIELD_MANIFEST,
        viewUniversalIdentifier: COMPANIES_VIEW_UID,
      },
    ]);
    expect(statusOf(coverage, 'custom-age-view-field')).toEqual({
      metadataName: 'viewField',
      universalIdentifier: 'custom-age-view-field',
      status: ApplicationExportCoverageStatus.EXPORTED,
    });
    expect(
      [
        'foreign-view-filter',
        'foreign-view-filter-group',
        'foreign-view-sort',
        'foreign-view-group',
        'foreign-view-field-group',
      ].map((universalIdentifier) => statusOf(coverage, universalIdentifier)),
    ).toEqual([
      {
        metadataName: 'viewFilter',
        universalIdentifier: 'foreign-view-filter',
        status: ApplicationExportCoverageStatus.UNSUPPORTED,
        reason: 'view filter on a view outside the application',
      },
      {
        metadataName: 'viewFilterGroup',
        universalIdentifier: 'foreign-view-filter-group',
        status: ApplicationExportCoverageStatus.UNSUPPORTED,
        reason: 'view filter group on a view outside the application',
      },
      {
        metadataName: 'viewSort',
        universalIdentifier: 'foreign-view-sort',
        status: ApplicationExportCoverageStatus.UNSUPPORTED,
        reason: 'view sort on a view outside the application',
      },
      {
        metadataName: 'viewGroup',
        universalIdentifier: 'foreign-view-group',
        status: ApplicationExportCoverageStatus.UNSUPPORTED,
        reason: 'view group on a view outside the application',
      },
      {
        metadataName: 'viewFieldGroup',
        universalIdentifier: 'foreign-view-field-group',
        status: ApplicationExportCoverageStatus.UNSUPPORTED,
        reason: 'view field group on a view outside the application',
      },
    ]);
    expect(statusOf(coverage, 'engine-view-filter')).toEqual({
      metadataName: 'viewFilter',
      universalIdentifier: 'engine-view-filter',
      status: ApplicationExportCoverageStatus.UNSUPPORTED,
      reason: 'view filter on an engine-derived view',
    });
  });

  it('should refuse a view without a name together with its view field', () => {
    const { views, viewFields, coverage } = reconstructViewsManifest({
      applicationAllFlatEntityMaps: buildMaps({
        objects: [petObject],
        views: [
          buildFlatView({
            viewManifest: {
              universalIdentifier: NAMELESS_VIEW_UID,
              name: '',
              objectUniversalIdentifier: PET_UID,
            },
          }),
        ],
        viewFields: [
          buildFlatViewField({
            viewFieldManifest: {
              universalIdentifier: 'nameless-view-field',
              fieldMetadataUniversalIdentifier: NAME_FIELD_UID,
              position: 0,
            },
            viewUniversalIdentifier: NAMELESS_VIEW_UID,
          }),
        ],
      }),
      allFlatEntityMaps,
      exportedObjectUniversalIdentifiers: EXPORTED_OBJECT_UNIVERSAL_IDENTIFIERS,
    });

    expect(views).toEqual([]);
    expect(viewFields).toEqual([]);
    expect(statusOf(coverage, NAMELESS_VIEW_UID)).toEqual({
      metadataName: 'view',
      universalIdentifier: NAMELESS_VIEW_UID,
      status: ApplicationExportCoverageStatus.UNSUPPORTED,
      reason: 'view without a name',
    });
    expect(statusOf(coverage, 'nameless-view-field')).toEqual({
      metadataName: 'viewField',
      universalIdentifier: 'nameless-view-field',
      status: ApplicationExportCoverageStatus.UNSUPPORTED,
      reason: 'view field of an unsupported view',
    });
  });

  it('should tell a view on an unsupported application object apart from a view on an object outside the application', () => {
    const { views, coverage } = reconstructViewsManifest({
      applicationAllFlatEntityMaps: buildMaps({
        objects: [petObject],
        views: [
          buildFlatView({ viewManifest: ALL_PETS_VIEW_MANIFEST }),
          buildFlatView({
            viewManifest: {
              universalIdentifier: PET_OWNERS_VIEW_UID,
              name: 'Pet owners',
              objectUniversalIdentifier: COMPANY_UID,
            },
          }),
        ],
      }),
      allFlatEntityMaps,
      exportedObjectUniversalIdentifiers: new Set(),
    });

    expect(views).toMatchObject([
      {
        universalIdentifier: PET_OWNERS_VIEW_UID,
        name: 'Pet owners',
        objectUniversalIdentifier: COMPANY_UID,
      },
    ]);
    expect(statusOf(coverage, ALL_PETS_VIEW_UID)).toEqual({
      metadataName: 'view',
      universalIdentifier: ALL_PETS_VIEW_UID,
      status: ApplicationExportCoverageStatus.UNSUPPORTED,
      reason: 'view on an unsupported object',
    });
    expect(statusOf(coverage, PET_OWNERS_VIEW_UID)).toEqual({
      metadataName: 'view',
      universalIdentifier: PET_OWNERS_VIEW_UID,
      status: ApplicationExportCoverageStatus.EXPORTED,
    });
  });

  it('should refuse a view referencing a field that does not exist together with its children', () => {
    const { views, viewFields, coverage } = reconstructViewsManifest({
      applicationAllFlatEntityMaps: buildMaps({
        objects: [petObject],
        views: [
          buildFlatView({
            viewManifest: {
              ...ALL_PETS_VIEW_MANIFEST,
              mainGroupByFieldMetadataUniversalIdentifier: MISSING_FIELD_UID,
            },
          }),
        ],
        viewFields: [
          buildFlatViewField({
            viewFieldManifest: NAME_VIEW_FIELD_MANIFEST,
            viewUniversalIdentifier: ALL_PETS_VIEW_UID,
          }),
        ],
      }),
      allFlatEntityMaps,
      exportedObjectUniversalIdentifiers: EXPORTED_OBJECT_UNIVERSAL_IDENTIFIERS,
    });

    expect(views).toEqual([]);
    expect(viewFields).toEqual([]);
    expect(statusOf(coverage, ALL_PETS_VIEW_UID)).toEqual({
      metadataName: 'view',
      universalIdentifier: ALL_PETS_VIEW_UID,
      status: ApplicationExportCoverageStatus.UNSUPPORTED,
      reason: 'view referencing a field that does not exist',
    });
    expect(
      statusOf(coverage, NAME_VIEW_FIELD_MANIFEST.universalIdentifier),
    ).toEqual({
      metadataName: 'viewField',
      universalIdentifier: NAME_VIEW_FIELD_MANIFEST.universalIdentifier,
      status: ApplicationExportCoverageStatus.UNSUPPORTED,
      reason: 'view field of an unsupported view',
    });
  });

  it('should refuse a view filter on a relation target field that does not exist', () => {
    const { views, coverage } = reconstructViewsManifest({
      applicationAllFlatEntityMaps: buildMaps({
        objects: [petObject],
        views: [buildFlatView({ viewManifest: ALL_PETS_VIEW_MANIFEST })],
        viewFilters: [
          buildFlatViewFilter({
            viewFilterManifest: {
              ...NAME_FILTER_MANIFEST,
              universalIdentifier: 'dangling-relation-target-view-filter',
              relationTargetFieldMetadataUniversalIdentifier: MISSING_FIELD_UID,
            },
            viewUniversalIdentifier: ALL_PETS_VIEW_UID,
          }),
        ],
      }),
      allFlatEntityMaps,
      exportedObjectUniversalIdentifiers: EXPORTED_OBJECT_UNIVERSAL_IDENTIFIERS,
    });

    expect(views).toEqual([ALL_PETS_VIEW_MANIFEST]);
    expect(statusOf(coverage, 'dangling-relation-target-view-filter')).toEqual({
      metadataName: 'viewFilter',
      universalIdentifier: 'dangling-relation-target-view-filter',
      status: ApplicationExportCoverageStatus.UNSUPPORTED,
      reason: 'view filter on a relation target field that does not exist',
    });
  });

  it('should refuse a view field placed in a field group that is not exported', () => {
    const { views, viewFields, coverage } = reconstructViewsManifest({
      applicationAllFlatEntityMaps: buildMaps({
        objects: [petObject],
        views: [
          buildFlatView({
            viewManifest: INDEX_VIEW_MANIFEST,
            key: ViewKey.INDEX,
            isSystemSideEffect: true,
          }),
        ],
        viewFieldGroups: [
          buildFlatViewFieldGroup({
            viewFieldGroupManifest: {
              universalIdentifier: 'custom-view-field-group',
              name: 'Details',
              position: 0,
            },
            viewUniversalIdentifier: INDEX_VIEW_UID,
          }),
        ],
        viewFields: [
          buildFlatViewField({
            viewFieldManifest: {
              ...CUSTOM_AGE_VIEW_FIELD_MANIFEST,
              viewFieldGroupUniversalIdentifier: 'custom-view-field-group',
            },
            viewUniversalIdentifier: INDEX_VIEW_UID,
          }),
        ],
      }),
      allFlatEntityMaps,
      exportedObjectUniversalIdentifiers: EXPORTED_OBJECT_UNIVERSAL_IDENTIFIERS,
    });

    expect(views).toEqual([]);
    expect(viewFields).toEqual([]);
    expect(statusOf(coverage, 'custom-view-field-group')).toEqual({
      metadataName: 'viewFieldGroup',
      universalIdentifier: 'custom-view-field-group',
      status: ApplicationExportCoverageStatus.UNSUPPORTED,
      reason: 'view field group on an engine-derived view',
    });
    expect(
      statusOf(coverage, CUSTOM_AGE_VIEW_FIELD_MANIFEST.universalIdentifier),
    ).toEqual({
      metadataName: 'viewField',
      universalIdentifier: CUSTOM_AGE_VIEW_FIELD_MANIFEST.universalIdentifier,
      status: ApplicationExportCoverageStatus.UNSUPPORTED,
      reason: 'view field in a view field group that is not exported',
    });
  });

  it('should refuse a view filter whose value is nested too deeply', () => {
    const deeplyNestedValue = Array.from({ length: 9 }).reduce<
      Record<string, unknown>
    >((nested) => ({ nested }), {});
    const { views, coverage } = reconstructViewsManifest({
      applicationAllFlatEntityMaps: buildMaps({
        objects: [petObject],
        views: [buildFlatView({ viewManifest: ALL_PETS_VIEW_MANIFEST })],
        viewFilters: [
          buildFlatViewFilter({
            viewFilterManifest: {
              ...NAME_FILTER_MANIFEST,
              universalIdentifier: 'deeply-nested-view-filter',
              value: deeplyNestedValue,
            },
            viewUniversalIdentifier: ALL_PETS_VIEW_UID,
          }),
        ],
      }),
      allFlatEntityMaps,
      exportedObjectUniversalIdentifiers: EXPORTED_OBJECT_UNIVERSAL_IDENTIFIERS,
    });

    expect(views).toEqual([ALL_PETS_VIEW_MANIFEST]);
    expect(statusOf(coverage, 'deeply-nested-view-filter')).toEqual({
      metadataName: 'viewFilter',
      universalIdentifier: 'deeply-nested-view-filter',
      status: ApplicationExportCoverageStatus.UNSUPPORTED,
      reason: 'view filter with a value nested deeper than 8 levels',
    });
  });

  it('should refuse a view field, a view filter and a view sort on a field that does not exist', () => {
    const { views, viewFields, coverage } = reconstructViewsManifest({
      applicationAllFlatEntityMaps: buildMaps({
        objects: [petObject],
        views: [buildFlatView({ viewManifest: ALL_PETS_VIEW_MANIFEST })],
        viewFields: [
          buildFlatViewField({
            viewFieldManifest: {
              universalIdentifier: 'dangling-view-field',
              fieldMetadataUniversalIdentifier: MISSING_FIELD_UID,
              position: 0,
            },
            viewUniversalIdentifier: ALL_PETS_VIEW_UID,
          }),
        ],
        viewFilters: [
          buildFlatViewFilter({
            viewFilterManifest: {
              ...NAME_FILTER_MANIFEST,
              universalIdentifier: 'dangling-view-filter',
              fieldMetadataUniversalIdentifier: MISSING_FIELD_UID,
            },
            viewUniversalIdentifier: ALL_PETS_VIEW_UID,
          }),
        ],
        viewSorts: [
          buildFlatViewSort({
            viewSortManifest: {
              ...NAME_SORT_MANIFEST,
              universalIdentifier: 'dangling-view-sort',
              fieldMetadataUniversalIdentifier: MISSING_FIELD_UID,
            },
            viewUniversalIdentifier: ALL_PETS_VIEW_UID,
          }),
        ],
      }),
      allFlatEntityMaps,
      exportedObjectUniversalIdentifiers: EXPORTED_OBJECT_UNIVERSAL_IDENTIFIERS,
    });

    expect(views).toEqual([ALL_PETS_VIEW_MANIFEST]);
    expect(viewFields).toEqual([]);
    expect(statusOf(coverage, 'dangling-view-field')).toEqual({
      metadataName: 'viewField',
      universalIdentifier: 'dangling-view-field',
      status: ApplicationExportCoverageStatus.UNSUPPORTED,
      reason: 'view field on a field that does not exist',
    });
    expect(statusOf(coverage, 'dangling-view-filter')).toEqual({
      metadataName: 'viewFilter',
      universalIdentifier: 'dangling-view-filter',
      status: ApplicationExportCoverageStatus.UNSUPPORTED,
      reason: 'view filter on a field that does not exist',
    });
    expect(statusOf(coverage, 'dangling-view-sort')).toEqual({
      metadataName: 'viewSort',
      universalIdentifier: 'dangling-view-sort',
      status: ApplicationExportCoverageStatus.UNSUPPORTED,
      reason: 'view sort on a field that does not exist',
    });
  });

  it('should disclose deactivation and workspace overrides on exported rows without applying them', () => {
    const { views, coverage } = reconstructViewsManifest({
      applicationAllFlatEntityMaps: buildMaps({
        objects: [petObject],
        views: [
          buildFlatView({
            viewManifest: ALL_PETS_VIEW_MANIFEST,
            isActive: false,
          }),
          buildFlatView({
            viewManifest: ZOO_PETS_VIEW_MANIFEST,
            overrides: { name: 'Zoo animals' },
          }),
        ],
        viewFields: [
          buildFlatViewField({
            viewFieldManifest: NAME_VIEW_FIELD_MANIFEST,
            viewUniversalIdentifier: ALL_PETS_VIEW_UID,
            overrides: { isVisible: false },
          }),
          buildFlatViewField({
            viewFieldManifest: AGE_VIEW_FIELD_MANIFEST,
            viewUniversalIdentifier: ALL_PETS_VIEW_UID,
          }),
        ],
      }),
      allFlatEntityMaps,
      exportedObjectUniversalIdentifiers: EXPORTED_OBJECT_UNIVERSAL_IDENTIFIERS,
    });

    expect(views.map(({ name }) => name)).toEqual(['Zoo pets', 'All pets']);
    expect(views[1].fields).toEqual([
      AGE_VIEW_FIELD_MANIFEST,
      NAME_VIEW_FIELD_MANIFEST,
    ]);
    expect(statusOf(coverage, ALL_PETS_VIEW_UID)).toEqual({
      metadataName: 'view',
      universalIdentifier: ALL_PETS_VIEW_UID,
      status: ApplicationExportCoverageStatus.EXPORTED,
      reason: 'deactivated in this workspace, exported active',
    });
    expect(statusOf(coverage, ZOO_PETS_VIEW_UID)).toEqual({
      metadataName: 'view',
      universalIdentifier: ZOO_PETS_VIEW_UID,
      status: ApplicationExportCoverageStatus.EXPORTED,
      reason: 'workspace overrides not exported',
    });
    expect(statusOf(coverage, 'name-view-field')).toEqual({
      metadataName: 'viewField',
      universalIdentifier: 'name-view-field',
      status: ApplicationExportCoverageStatus.EXPORTED,
      reason: 'workspace overrides not exported',
    });
    expect(statusOf(coverage, 'age-view-field')).toEqual({
      metadataName: 'viewField',
      universalIdentifier: 'age-view-field',
      status: ApplicationExportCoverageStatus.EXPORTED,
    });
  });

  it('should order standalone view fields by universal identifier', () => {
    const { viewFields } = reconstructViewsManifest({
      applicationAllFlatEntityMaps: buildMaps({
        viewFields: [
          buildFlatViewField({
            viewFieldManifest: {
              universalIdentifier: 'a-people-view-field',
              fieldMetadataUniversalIdentifier: NAME_FIELD_UID,
              position: 0,
            },
            viewUniversalIdentifier: PEOPLE_VIEW_UID,
          }),
          buildFlatViewField({
            viewFieldManifest: {
              universalIdentifier: 'b-second-companies-view-field',
              fieldMetadataUniversalIdentifier: AGE_FIELD_UID,
              position: 1,
            },
            viewUniversalIdentifier: COMPANIES_VIEW_UID,
          }),
          buildFlatViewField({
            viewFieldManifest: {
              universalIdentifier: 'z-tied-companies-view-field',
              fieldMetadataUniversalIdentifier: SPECIES_FIELD_UID,
              position: 0,
            },
            viewUniversalIdentifier: COMPANIES_VIEW_UID,
          }),
          buildFlatViewField({
            viewFieldManifest: {
              universalIdentifier: 'c-tied-companies-view-field',
              fieldMetadataUniversalIdentifier: NAME_FIELD_UID,
              position: 0,
            },
            viewUniversalIdentifier: COMPANIES_VIEW_UID,
          }),
        ],
      }),
      allFlatEntityMaps,
      exportedObjectUniversalIdentifiers: EXPORTED_OBJECT_UNIVERSAL_IDENTIFIERS,
    });

    expect(
      viewFields.map(({ universalIdentifier }) => universalIdentifier),
    ).toEqual([
      'a-people-view-field',
      'b-second-companies-view-field',
      'c-tied-companies-view-field',
      'z-tied-companies-view-field',
    ]);
  });

  it('should report exactly one coverage entry per input row', () => {
    const views = [
      buildFlatView({ viewManifest: ALL_PETS_VIEW_MANIFEST }),
      buildFlatView({
        viewManifest: INDEX_VIEW_MANIFEST,
        isSystemSideEffect: true,
      }),
      buildFlatView({
        viewManifest: {
          universalIdentifier: NAMELESS_VIEW_UID,
          name: '',
          objectUniversalIdentifier: PET_UID,
        },
      }),
    ];
    const viewFields = [
      buildFlatViewField({
        viewFieldManifest: NAME_VIEW_FIELD_MANIFEST,
        viewUniversalIdentifier: ALL_PETS_VIEW_UID,
      }),
      buildFlatViewField({
        viewFieldManifest: {
          universalIdentifier: 'engine-name-view-field',
          fieldMetadataUniversalIdentifier: NAME_FIELD_UID,
          position: 0,
        },
        viewUniversalIdentifier: INDEX_VIEW_UID,
        isSystemSideEffect: true,
      }),
      buildFlatViewField({
        viewFieldManifest: CUSTOM_AGE_VIEW_FIELD_MANIFEST,
        viewUniversalIdentifier: INDEX_VIEW_UID,
      }),
      buildFlatViewField({
        viewFieldManifest: {
          universalIdentifier: 'nameless-view-field',
          fieldMetadataUniversalIdentifier: NAME_FIELD_UID,
          position: 0,
        },
        viewUniversalIdentifier: NAMELESS_VIEW_UID,
      }),
      buildFlatViewField({
        viewFieldManifest: {
          universalIdentifier: 'foreign-view-field',
          fieldMetadataUniversalIdentifier: NAME_FIELD_UID,
          position: 0,
        },
        viewUniversalIdentifier: COMPANIES_VIEW_UID,
      }),
    ];
    const viewFieldGroups = [
      buildFlatViewFieldGroup({
        viewFieldGroupManifest: DETAILS_FIELD_GROUP_MANIFEST,
        viewUniversalIdentifier: ALL_PETS_VIEW_UID,
      }),
      buildFlatViewFieldGroup({
        viewFieldGroupManifest: {
          universalIdentifier: 'engine-view-field-group',
          position: 0,
        },
        viewUniversalIdentifier: INDEX_VIEW_UID,
        isSystemSideEffect: true,
      }),
      buildFlatViewFieldGroup({
        viewFieldGroupManifest: {
          universalIdentifier: 'nameless-view-field-group',
          position: 0,
        },
        viewUniversalIdentifier: NAMELESS_VIEW_UID,
      }),
    ];
    const viewFilterGroups = [
      buildFlatViewFilterGroup({
        viewFilterGroupManifest: ROOT_FILTER_GROUP_MANIFEST,
        viewUniversalIdentifier: ALL_PETS_VIEW_UID,
      }),
      buildFlatViewFilterGroup({
        viewFilterGroupManifest: {
          ...ROOT_FILTER_GROUP_MANIFEST,
          universalIdentifier: 'foreign-view-filter-group',
        },
        viewUniversalIdentifier: COMPANIES_VIEW_UID,
      }),
    ];
    const viewGroups = [
      buildFlatViewGroup({
        viewGroupManifest: DOG_GROUP_MANIFEST,
        viewUniversalIdentifier: ALL_PETS_VIEW_UID,
      }),
      buildFlatViewGroup({
        viewGroupManifest: {
          ...DOG_GROUP_MANIFEST,
          universalIdentifier: 'engine-view-group',
        },
        viewUniversalIdentifier: INDEX_VIEW_UID,
      }),
    ];
    const viewFilters = [
      buildFlatViewFilter({
        viewFilterManifest: {
          ...NAME_FILTER_MANIFEST,
          universalIdentifier: 'foreign-view-filter',
        },
        viewUniversalIdentifier: COMPANIES_VIEW_UID,
      }),
      buildFlatViewFilter({
        viewFilterManifest: {
          ...NAME_FILTER_MANIFEST,
          universalIdentifier: 'dangling-view-filter',
          fieldMetadataUniversalIdentifier: MISSING_FIELD_UID,
        },
        viewUniversalIdentifier: ALL_PETS_VIEW_UID,
      }),
    ];
    const viewSorts = [
      buildFlatViewSort({
        viewSortManifest: NAME_SORT_MANIFEST,
        viewUniversalIdentifier: ALL_PETS_VIEW_UID,
      }),
      buildFlatViewSort({
        viewSortManifest: {
          ...NAME_SORT_MANIFEST,
          universalIdentifier: 'dangling-view-sort',
          fieldMetadataUniversalIdentifier: MISSING_FIELD_UID,
        },
        viewUniversalIdentifier: ALL_PETS_VIEW_UID,
      }),
    ];
    const rows = [
      ...views,
      ...viewFields,
      ...viewFieldGroups,
      ...viewFilterGroups,
      ...viewGroups,
      ...viewFilters,
      ...viewSorts,
    ];

    const { coverage } = reconstructViewsManifest({
      applicationAllFlatEntityMaps: buildMaps({
        objects: [petObject],
        views,
        viewFields,
        viewFieldGroups,
        viewFilterGroups,
        viewGroups,
        viewFilters,
        viewSorts,
      }),
      allFlatEntityMaps,
      exportedObjectUniversalIdentifiers: EXPORTED_OBJECT_UNIVERSAL_IDENTIFIERS,
    });

    expect(coverage).toHaveLength(rows.length);
    expect(
      coverage.map(({ universalIdentifier }) => universalIdentifier).sort(),
    ).toEqual(
      rows.map(({ universalIdentifier }) => universalIdentifier).sort(),
    );
  });
});
