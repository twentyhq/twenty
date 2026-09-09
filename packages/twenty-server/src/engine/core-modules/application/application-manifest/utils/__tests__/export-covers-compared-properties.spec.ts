import {
  type PageLayoutManifest,
  type PageLayoutTabManifest,
  type PageLayoutWidgetManifest,
  type StandaloneViewFieldManifest,
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
  PageLayoutTabLayoutMode,
  PageLayoutType,
  ViewCalendarLayout,
  ViewFilterGroupLogicalOperator,
  ViewFilterOperand,
  ViewOpenRecordIn,
  ViewSortDirection,
  ViewType,
  ViewVisibility,
} from 'twenty-shared/types';

import { fromFlatFieldMetadataToFieldManifest } from 'src/engine/core-modules/application/application-manifest/converters/from-flat-field-metadata-to-field-manifest.util';
import { fromFlatIndexMetadataToIndexManifest } from 'src/engine/core-modules/application/application-manifest/converters/from-flat-index-metadata-to-index-manifest.util';
import { fromFlatObjectMetadataToObjectManifest } from 'src/engine/core-modules/application/application-manifest/converters/from-flat-object-metadata-to-object-manifest.util';
import { fromFlatPageLayoutTabToPageLayoutTabManifest } from 'src/engine/core-modules/application/application-manifest/converters/from-flat-page-layout-tab-to-page-layout-tab-manifest.util';
import { fromFlatPageLayoutToPageLayoutManifest } from 'src/engine/core-modules/application/application-manifest/converters/from-flat-page-layout-to-page-layout-manifest.util';
import { fromFlatPageLayoutWidgetToPageLayoutWidgetManifest } from 'src/engine/core-modules/application/application-manifest/converters/from-flat-page-layout-widget-to-page-layout-widget-manifest.util';
import { fromPageLayoutManifestToUniversalFlatPageLayout } from 'src/engine/core-modules/application/application-manifest/converters/from-page-layout-manifest-to-universal-flat-page-layout.util';
import { fromPageLayoutTabManifestToUniversalFlatPageLayoutTab } from 'src/engine/core-modules/application/application-manifest/converters/from-page-layout-tab-manifest-to-universal-flat-page-layout-tab.util';
import { fromPageLayoutWidgetManifestToUniversalFlatPageLayoutWidget } from 'src/engine/core-modules/application/application-manifest/converters/from-page-layout-widget-manifest-to-universal-flat-page-layout-widget.util';
import { fromFlatViewFieldGroupToViewFieldGroupManifest } from 'src/engine/core-modules/application/application-manifest/converters/from-flat-view-field-group-to-view-field-group-manifest.util';
import { fromFlatViewFieldToStandaloneViewFieldManifest } from 'src/engine/core-modules/application/application-manifest/converters/from-flat-view-field-to-standalone-view-field-manifest.util';
import { fromFlatViewFilterGroupToViewFilterGroupManifest } from 'src/engine/core-modules/application/application-manifest/converters/from-flat-view-filter-group-to-view-filter-group-manifest.util';
import { fromFlatViewFilterToViewFilterManifest } from 'src/engine/core-modules/application/application-manifest/converters/from-flat-view-filter-to-view-filter-manifest.util';
import { fromFlatViewGroupToViewGroupManifest } from 'src/engine/core-modules/application/application-manifest/converters/from-flat-view-group-to-view-group-manifest.util';
import { fromFlatViewSortToViewSortManifest } from 'src/engine/core-modules/application/application-manifest/converters/from-flat-view-sort-to-view-sort-manifest.util';
import { fromFlatViewToViewManifest } from 'src/engine/core-modules/application/application-manifest/converters/from-flat-view-to-view-manifest.util';
import { fromViewFieldGroupManifestToUniversalFlatViewFieldGroup } from 'src/engine/core-modules/application/application-manifest/converters/from-view-field-group-manifest-to-universal-flat-view-field-group.util';
import { fromViewFieldManifestToUniversalFlatViewField } from 'src/engine/core-modules/application/application-manifest/converters/from-view-field-manifest-to-universal-flat-view-field.util';
import { fromViewFilterGroupManifestToUniversalFlatViewFilterGroup } from 'src/engine/core-modules/application/application-manifest/converters/from-view-filter-group-manifest-to-universal-flat-view-filter-group.util';
import { fromViewFilterManifestToUniversalFlatViewFilter } from 'src/engine/core-modules/application/application-manifest/converters/from-view-filter-manifest-to-universal-flat-view-filter.util';
import { fromViewGroupManifestToUniversalFlatViewGroup } from 'src/engine/core-modules/application/application-manifest/converters/from-view-group-manifest-to-universal-flat-view-group.util';
import { fromViewManifestToUniversalFlatView } from 'src/engine/core-modules/application/application-manifest/converters/from-view-manifest-to-universal-flat-view.util';
import { fromViewSortManifestToUniversalFlatViewSort } from 'src/engine/core-modules/application/application-manifest/converters/from-view-sort-manifest-to-universal-flat-view-sort.util';
import { ALL_UNIVERSAL_FLAT_ENTITY_PROPERTIES_TO_COMPARE_AND_STRINGIFY } from 'src/engine/metadata-modules/flat-entity/constant/all-universal-flat-entity-properties-to-compare-and-stringify.constant';
import { getFlatFieldMetadataMock } from 'src/engine/metadata-modules/flat-field-metadata/__mocks__/get-flat-field-metadata.mock';
import { getFlatIndexMetadataMock } from 'src/engine/metadata-modules/flat-index-metadata/__mocks__/get-flat-index-metadata.mock';
import { getFlatObjectMetadataMock } from 'src/engine/metadata-modules/flat-object-metadata/__mocks__/get-flat-object-metadata.mock';

const APP_UID = '11111111-1111-4111-8111-111111111111';
const OBJECT_UID = '22222222-2222-4222-8222-222222222222';
const FIELD_UID = '33333333-3333-4333-8333-333333333333';
const INDEX_UID = '44444444-4444-4444-8444-444444444444';
const VIEW_UID = '55555555-5555-4555-8555-555555555555';
const VIEW_FIELD_UID = '66666666-6666-4666-8666-666666666666';
const VIEW_FILTER_UID = '77777777-7777-4777-8777-777777777777';
const VIEW_FILTER_GROUP_UID = '88888888-8888-4888-8888-888888888888';
const PARENT_VIEW_FILTER_GROUP_UID = '99999999-9999-4999-8999-999999999999';
const VIEW_GROUP_UID = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
const VIEW_FIELD_GROUP_UID = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
const VIEW_SORT_UID = 'cccccccc-cccc-4ccc-8ccc-cccccccccccc';
const NOW = '2026-09-08T00:00:00.000Z';

const VIEW_FIELD_MANIFEST: ViewFieldManifest = {
  universalIdentifier: VIEW_FIELD_UID,
  fieldMetadataUniversalIdentifier: FIELD_UID,
  isVisible: true,
  size: 150,
  position: 0,
  aggregateOperation: AggregateOperations.COUNT,
  viewFieldGroupUniversalIdentifier: VIEW_FIELD_GROUP_UID,
};

const STANDALONE_VIEW_FIELD_MANIFEST: StandaloneViewFieldManifest = {
  ...VIEW_FIELD_MANIFEST,
  viewUniversalIdentifier: VIEW_UID,
};

const VIEW_FILTER_MANIFEST: ViewFilterManifest = {
  universalIdentifier: VIEW_FILTER_UID,
  fieldMetadataUniversalIdentifier: FIELD_UID,
  operand: ViewFilterOperand.CONTAINS,
  value: 'acme',
  subFieldName: 'primaryLinkUrl',
  relationTargetFieldMetadataUniversalIdentifier: FIELD_UID,
  viewFilterGroupUniversalIdentifier: VIEW_FILTER_GROUP_UID,
  positionInViewFilterGroup: 0,
};

const VIEW_FILTER_GROUP_MANIFEST: ViewFilterGroupManifest = {
  universalIdentifier: VIEW_FILTER_GROUP_UID,
  logicalOperator: ViewFilterGroupLogicalOperator.AND,
  parentViewFilterGroupUniversalIdentifier: PARENT_VIEW_FILTER_GROUP_UID,
  positionInViewFilterGroup: 0,
};

const VIEW_GROUP_MANIFEST: ViewGroupManifest = {
  universalIdentifier: VIEW_GROUP_UID,
  fieldValue: 'won',
  isVisible: true,
  position: 0,
};

const VIEW_FIELD_GROUP_MANIFEST: ViewFieldGroupManifest = {
  universalIdentifier: VIEW_FIELD_GROUP_UID,
  name: 'Details',
  position: 0,
  isVisible: true,
};

const VIEW_SORT_MANIFEST: ViewSortManifest = {
  universalIdentifier: VIEW_SORT_UID,
  fieldMetadataUniversalIdentifier: FIELD_UID,
  direction: ViewSortDirection.DESC,
  subFieldName: 'primaryLinkUrl',
};

const VIEW_MANIFEST: ViewManifest = {
  universalIdentifier: VIEW_UID,
  name: 'Pipeline',
  objectUniversalIdentifier: OBJECT_UID,
  type: ViewType.KANBAN,
  icon: 'IconLayoutKanban',
  position: 3,
  isCompact: true,
  visibility: ViewVisibility.UNLISTED,
  openRecordIn: ViewOpenRecordIn.RECORD_PAGE,
  mainGroupByFieldMetadataUniversalIdentifier: FIELD_UID,
  shouldHideEmptyGroups: true,
  anyFieldFilterValue: 'acme',
  kanbanColumnWidth: 240,
  kanbanAggregateOperation: AggregateOperations.SUM,
  kanbanAggregateOperationFieldMetadataUniversalIdentifier: FIELD_UID,
  calendarLayout: ViewCalendarLayout.WEEK,
  calendarFieldMetadataUniversalIdentifier: FIELD_UID,
  calendarEndFieldMetadataUniversalIdentifier: FIELD_UID,
};

const VIEW_CHILD_CONVERSION_CONTEXT = {
  viewUniversalIdentifier: VIEW_UID,
  applicationUniversalIdentifier: APP_UID,
  now: NOW,
};

const PAGE_LAYOUT_UID = 'dddddddd-dddd-4ddd-8ddd-dddddddddddd';
const PAGE_LAYOUT_TAB_UID = 'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee';
const PAGE_LAYOUT_WIDGET_UID = 'ffffffff-ffff-4fff-8fff-ffffffffffff';

const PAGE_LAYOUT_WIDGET_MANIFEST: PageLayoutWidgetManifest = {
  universalIdentifier: PAGE_LAYOUT_WIDGET_UID,
  title: 'Fields',
  type: 'FIELDS',
  objectUniversalIdentifier: OBJECT_UID,
  conditionalDisplay: { device: 'DESKTOP' },
  position: { layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST, index: 0 },
  configuration: {
    configurationType: 'FIELDS',
    viewUniversalIdentifier: VIEW_UID,
    newFieldDefaultVisibility: true,
  },
};

const PAGE_LAYOUT_TAB_MANIFEST: PageLayoutTabManifest = {
  universalIdentifier: PAGE_LAYOUT_TAB_UID,
  title: 'Overview',
  position: 0,
  icon: 'IconHome',
  layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
  widgets: [PAGE_LAYOUT_WIDGET_MANIFEST],
};

const PAGE_LAYOUT_MANIFEST: PageLayoutManifest = {
  universalIdentifier: PAGE_LAYOUT_UID,
  name: 'Pet page',
  type: 'RECORD_PAGE',
  objectUniversalIdentifier: OBJECT_UID,
  defaultTabToFocusOnMobileAndSidePanelUniversalIdentifier: PAGE_LAYOUT_TAB_UID,
  tabs: [PAGE_LAYOUT_TAB_MANIFEST],
};

const PAGE_LAYOUT_KIND_GAPS = {
  deletedAt:
    'page layouts, tabs and widgets are never soft-deleted; the column is scheduled for removal',
};

const VIEW_KIND_GAPS = {
  deletedAt:
    'views and their children are never soft-deleted; the column is scheduled for removal',
};

const NESTED_VIEW_CHILD_GAPS = {
  ...VIEW_KIND_GAPS,
  viewUniversalIdentifier:
    'a nested child is written under its view; the standalone view field converter emits it',
};

type ExportedKind = {
  metadataName: keyof typeof ALL_UNIVERSAL_FLAT_ENTITY_PROPERTIES_TO_COMPARE_AND_STRINGIFY;
  emittedProperties: string[];
  renamedProperties: Record<string, string>;
  workspaceLocalProperties: string[];
  knownGaps: Record<string, string>;
};

const WORKSPACE_LOCAL_PROPERTIES = ['isActive', 'overrides'];

const EXPORTED_KINDS: ExportedKind[] = [
  {
    metadataName: 'objectMetadata',
    emittedProperties: Object.keys(
      fromFlatObjectMetadataToObjectManifest({
        flatObjectMetadata: getFlatObjectMetadataMock({
          universalIdentifier: OBJECT_UID,
          applicationUniversalIdentifier: APP_UID,
          description: 'An object',
          icon: 'IconBox',
          color: 'blue',
          imageIdentifierFieldMetadataUniversalIdentifier: FIELD_UID,
          labelIdentifierFieldMetadataUniversalIdentifier: FIELD_UID,
        }),
        fields: [],
        labelIdentifierFieldMetadataUniversalIdentifier: FIELD_UID,
      }),
    ),
    renamedProperties: {},
    workspaceLocalProperties: WORKSPACE_LOCAL_PROPERTIES,
    knownGaps: {},
  },
  {
    metadataName: 'fieldMetadata',
    emittedProperties: Object.keys(
      fromFlatFieldMetadataToFieldManifest({
        flatFieldMetadata: getFlatFieldMetadataMock({
          universalIdentifier: FIELD_UID,
          objectMetadataId: 'object-id',
          objectMetadataUniversalIdentifier: OBJECT_UID,
          applicationUniversalIdentifier: APP_UID,
          type: FieldMetadataType.TEXT,
          description: 'A field',
          icon: 'IconAbc',
          defaultValue: "'x'",
          options: null,
          universalSettings: null,
        }),
      }),
    ),
    renamedProperties: {},
    workspaceLocalProperties: WORKSPACE_LOCAL_PROPERTIES,
    knownGaps: {},
  },
  {
    metadataName: 'index',
    emittedProperties: Object.keys(
      fromFlatIndexMetadataToIndexManifest({
        flatIndexMetadata: getFlatIndexMetadataMock({
          universalIdentifier: INDEX_UID,
          objectMetadataId: 'object-id',
          objectMetadataUniversalIdentifier: OBJECT_UID,
          applicationUniversalIdentifier: APP_UID,
        }),
      }),
    ),
    renamedProperties: { universalFlatIndexFieldMetadatas: 'fields' },
    workspaceLocalProperties: [],
    knownGaps: {
      name: 'the forward converter derives the index name from the object and field names, so a renamed index is a known asymmetry',
      indexWhereClause:
        'partial indexes are reported as unsupported instead of exported',
    },
  },
  {
    metadataName: 'view',
    emittedProperties: Object.keys(
      fromFlatViewToViewManifest({
        flatView: fromViewManifestToUniversalFlatView({
          viewManifest: VIEW_MANIFEST,
          applicationUniversalIdentifier: APP_UID,
          now: NOW,
        }),
        children: {
          fields: [VIEW_FIELD_MANIFEST],
          filters: [VIEW_FILTER_MANIFEST],
          filterGroups: [VIEW_FILTER_GROUP_MANIFEST],
          groups: [VIEW_GROUP_MANIFEST],
          fieldGroups: [VIEW_FIELD_GROUP_MANIFEST],
          sorts: [VIEW_SORT_MANIFEST],
        },
      }),
    ),
    renamedProperties: {},
    workspaceLocalProperties: [
      'isActive',
      'universalOverrides',
      'createdByUserWorkspaceId',
    ],
    knownGaps: VIEW_KIND_GAPS,
  },
  {
    metadataName: 'viewField',
    emittedProperties: Object.keys(
      fromFlatViewFieldToStandaloneViewFieldManifest({
        flatViewField: fromViewFieldManifestToUniversalFlatViewField({
          viewFieldManifest: STANDALONE_VIEW_FIELD_MANIFEST,
          ...VIEW_CHILD_CONVERSION_CONTEXT,
        }),
      }),
    ),
    renamedProperties: {},
    workspaceLocalProperties: ['isActive', 'universalOverrides'],
    knownGaps: VIEW_KIND_GAPS,
  },
  {
    metadataName: 'viewFilter',
    emittedProperties: Object.keys(
      fromFlatViewFilterToViewFilterManifest({
        flatViewFilter: fromViewFilterManifestToUniversalFlatViewFilter({
          viewFilterManifest: VIEW_FILTER_MANIFEST,
          ...VIEW_CHILD_CONVERSION_CONTEXT,
        }),
      }),
    ),
    renamedProperties: {},
    workspaceLocalProperties: [],
    knownGaps: NESTED_VIEW_CHILD_GAPS,
  },
  {
    metadataName: 'viewFilterGroup',
    emittedProperties: Object.keys(
      fromFlatViewFilterGroupToViewFilterGroupManifest({
        flatViewFilterGroup:
          fromViewFilterGroupManifestToUniversalFlatViewFilterGroup({
            viewFilterGroupManifest: VIEW_FILTER_GROUP_MANIFEST,
            ...VIEW_CHILD_CONVERSION_CONTEXT,
          }),
      }),
    ),
    renamedProperties: {},
    workspaceLocalProperties: [],
    knownGaps: NESTED_VIEW_CHILD_GAPS,
  },
  {
    metadataName: 'viewGroup',
    emittedProperties: Object.keys(
      fromFlatViewGroupToViewGroupManifest({
        flatViewGroup: fromViewGroupManifestToUniversalFlatViewGroup({
          viewGroupManifest: VIEW_GROUP_MANIFEST,
          ...VIEW_CHILD_CONVERSION_CONTEXT,
        }),
      }),
    ),
    renamedProperties: {},
    workspaceLocalProperties: [],
    knownGaps: NESTED_VIEW_CHILD_GAPS,
  },
  {
    metadataName: 'viewFieldGroup',
    emittedProperties: Object.keys(
      fromFlatViewFieldGroupToViewFieldGroupManifest({
        flatViewFieldGroup:
          fromViewFieldGroupManifestToUniversalFlatViewFieldGroup({
            viewFieldGroupManifest: VIEW_FIELD_GROUP_MANIFEST,
            ...VIEW_CHILD_CONVERSION_CONTEXT,
          }),
      }),
    ),
    renamedProperties: {},
    workspaceLocalProperties: ['isActive', 'overrides'],
    knownGaps: NESTED_VIEW_CHILD_GAPS,
  },
  {
    metadataName: 'viewSort',
    emittedProperties: Object.keys(
      fromFlatViewSortToViewSortManifest({
        flatViewSort: fromViewSortManifestToUniversalFlatViewSort({
          viewSortManifest: VIEW_SORT_MANIFEST,
          ...VIEW_CHILD_CONVERSION_CONTEXT,
        }),
      }),
    ),
    renamedProperties: {},
    workspaceLocalProperties: [],
    knownGaps: NESTED_VIEW_CHILD_GAPS,
  },
  {
    metadataName: 'pageLayout',
    emittedProperties: Object.keys(
      fromFlatPageLayoutToPageLayoutManifest({
        flatPageLayout: fromPageLayoutManifestToUniversalFlatPageLayout({
          pageLayoutManifest: PAGE_LAYOUT_MANIFEST,
          applicationUniversalIdentifier: APP_UID,
          now: NOW,
        }),
        tabs: [PAGE_LAYOUT_TAB_MANIFEST],
      }),
    ),
    renamedProperties: {
      objectMetadataUniversalIdentifier: 'objectUniversalIdentifier',
    },
    workspaceLocalProperties: [],
    knownGaps: {
      ...PAGE_LAYOUT_KIND_GAPS,
      isFirstTabPinned:
        'workspace-owned: the sync keeps the live value, so the forward default never diffs',
    },
  },
  {
    metadataName: 'pageLayoutTab',
    emittedProperties: Object.keys(
      fromFlatPageLayoutTabToPageLayoutTabManifest({
        flatPageLayoutTab:
          fromPageLayoutTabManifestToUniversalFlatPageLayoutTab({
            pageLayoutTabManifest: PAGE_LAYOUT_TAB_MANIFEST,
            pageLayoutUniversalIdentifier: PAGE_LAYOUT_UID,
            pageLayoutType: PageLayoutType.RECORD_PAGE,
            applicationUniversalIdentifier: APP_UID,
            now: NOW,
          }),
        widgets: [PAGE_LAYOUT_WIDGET_MANIFEST],
      }),
    ),
    renamedProperties: {},
    workspaceLocalProperties: ['isActive', 'overrides'],
    knownGaps: PAGE_LAYOUT_KIND_GAPS,
  },
  {
    metadataName: 'pageLayoutWidget',
    emittedProperties: Object.keys(
      fromFlatPageLayoutWidgetToPageLayoutWidgetManifest({
        flatPageLayoutWidget:
          fromPageLayoutWidgetManifestToUniversalFlatPageLayoutWidget({
            pageLayoutWidgetManifest: PAGE_LAYOUT_WIDGET_MANIFEST,
            pageLayoutTabUniversalIdentifier: PAGE_LAYOUT_TAB_UID,
            pageLayoutTabLayoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
            applicationUniversalIdentifier: APP_UID,
            now: NOW,
          }),
      }),
    ),
    renamedProperties: {
      objectMetadataUniversalIdentifier: 'objectUniversalIdentifier',
      universalConfiguration: 'configuration',
    },
    workspaceLocalProperties: ['isActive', 'universalOverrides'],
    knownGaps: {
      ...PAGE_LAYOUT_KIND_GAPS,
      pageLayoutTabUniversalIdentifier:
        'a widget is written under its tab; there is no standalone widget slot',
      conditionalAvailabilityExpression:
        'no manifest slot; a widget carrying one is reported as unsupported',
    },
  },
];

describe('export coverage of the compared properties', () => {
  it.each(EXPORTED_KINDS)(
    'should emit every compared property of $metadataName or account for it explicitly',
    ({
      metadataName,
      emittedProperties,
      renamedProperties,
      workspaceLocalProperties,
      knownGaps,
    }) => {
      const comparedProperties: readonly string[] =
        ALL_UNIVERSAL_FLAT_ENTITY_PROPERTIES_TO_COMPARE_AND_STRINGIFY[
          metadataName
        ].propertiesToCompare;
      const unaccounted = comparedProperties.filter(
        (property) =>
          !emittedProperties.includes(
            renamedProperties[property] ?? property,
          ) &&
          !workspaceLocalProperties.includes(property) &&
          !(property in knownGaps),
      );

      expect(unaccounted).toEqual([]);
    },
  );

  it.each(EXPORTED_KINDS)(
    'should not keep accounting for a property of $metadataName that is now emitted or no longer compared',
    ({
      metadataName,
      emittedProperties,
      renamedProperties,
      workspaceLocalProperties,
      knownGaps,
    }) => {
      const comparedProperties: readonly string[] =
        ALL_UNIVERSAL_FLAT_ENTITY_PROPERTIES_TO_COMPARE_AND_STRINGIFY[
          metadataName
        ].propertiesToCompare;
      const staleEntries = [
        ...workspaceLocalProperties,
        ...Object.keys(knownGaps),
        ...Object.keys(renamedProperties),
      ].filter(
        (property) =>
          emittedProperties.includes(property) ||
          !comparedProperties.includes(property),
      );

      expect(staleEntries).toEqual([]);
    },
  );
});
