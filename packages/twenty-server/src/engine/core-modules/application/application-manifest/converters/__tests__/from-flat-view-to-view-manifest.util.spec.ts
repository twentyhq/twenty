import {
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
  ViewCalendarLayout,
  ViewFilterGroupLogicalOperator,
  ViewFilterOperand,
  ViewKey,
  ViewOpenRecordIn,
  ViewSortDirection,
  ViewType,
  ViewVisibility,
} from 'twenty-shared/types';

import { fromFlatViewToViewManifest } from 'src/engine/core-modules/application/application-manifest/converters/from-flat-view-to-view-manifest.util';
import { fromViewManifestToUniversalFlatView } from 'src/engine/core-modules/application/application-manifest/converters/from-view-manifest-to-universal-flat-view.util';
import { type UniversalFlatView } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-view.type';
import { compareTwoFlatEntity } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/utils/compare-two-universal-flat-entity.util';

const APP_UID = '11111111-1111-4111-8111-111111111111';
const OBJECT_UID = '22222222-2222-4222-8222-222222222222';
const VIEW_UID = '33333333-3333-4333-8333-333333333333';
const STAGE_FIELD_UID = '44444444-4444-4444-8444-444444444444';
const AMOUNT_FIELD_UID = '55555555-5555-4555-8555-555555555555';
const START_DATE_FIELD_UID = '66666666-6666-4666-8666-666666666666';
const END_DATE_FIELD_UID = '77777777-7777-4777-8777-777777777777';
const VIEW_FIELD_UID = '88888888-8888-4888-8888-888888888888';
const VIEW_FILTER_UID = '99999999-9999-4999-8999-999999999999';
const VIEW_FILTER_GROUP_UID = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
const VIEW_GROUP_UID = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
const VIEW_FIELD_GROUP_UID = 'cccccccc-cccc-4ccc-8ccc-cccccccccccc';
const VIEW_SORT_UID = 'dddddddd-dddd-4ddd-8ddd-dddddddddddd';
const NOW = '2026-09-03T10:00:00.000Z';

const VIEW_MANIFEST: Required<
  Omit<
    ViewManifest,
    | 'key'
    | 'fields'
    | 'filters'
    | 'filterGroups'
    | 'groups'
    | 'fieldGroups'
    | 'sorts'
  >
> = {
  universalIdentifier: VIEW_UID,
  name: 'Pipeline',
  objectUniversalIdentifier: OBJECT_UID,
  type: ViewType.KANBAN,
  icon: 'IconLayoutKanban',
  position: 3,
  isCompact: true,
  visibility: ViewVisibility.UNLISTED,
  openRecordIn: ViewOpenRecordIn.RECORD_PAGE,
  mainGroupByFieldMetadataUniversalIdentifier: STAGE_FIELD_UID,
  shouldHideEmptyGroups: true,
  anyFieldFilterValue: 'acme',
  kanbanColumnWidth: 240,
  kanbanAggregateOperation: AggregateOperations.SUM,
  kanbanAggregateOperationFieldMetadataUniversalIdentifier: AMOUNT_FIELD_UID,
  calendarLayout: ViewCalendarLayout.WEEK,
  calendarFieldMetadataUniversalIdentifier: START_DATE_FIELD_UID,
  calendarEndFieldMetadataUniversalIdentifier: END_DATE_FIELD_UID,
};

const MINIMAL_VIEW_MANIFEST: ViewManifest = {
  universalIdentifier: VIEW_UID,
  name: 'All pets',
  objectUniversalIdentifier: OBJECT_UID,
};

const VIEW_FIELD_MANIFEST: ViewFieldManifest = {
  universalIdentifier: VIEW_FIELD_UID,
  fieldMetadataUniversalIdentifier: AMOUNT_FIELD_UID,
  position: 0,
  isVisible: true,
  size: 150,
};

const VIEW_FILTER_MANIFEST: ViewFilterManifest = {
  universalIdentifier: VIEW_FILTER_UID,
  fieldMetadataUniversalIdentifier: STAGE_FIELD_UID,
  operand: ViewFilterOperand.IS,
  value: ['won'],
};

const VIEW_FILTER_GROUP_MANIFEST: ViewFilterGroupManifest = {
  universalIdentifier: VIEW_FILTER_GROUP_UID,
  logicalOperator: ViewFilterGroupLogicalOperator.AND,
};

const VIEW_GROUP_MANIFEST: ViewGroupManifest = {
  universalIdentifier: VIEW_GROUP_UID,
  fieldValue: 'won',
  position: 0,
};

const VIEW_FIELD_GROUP_MANIFEST: ViewFieldGroupManifest = {
  universalIdentifier: VIEW_FIELD_GROUP_UID,
  name: 'Details',
  position: 0,
};

const VIEW_SORT_MANIFEST: ViewSortManifest = {
  universalIdentifier: VIEW_SORT_UID,
  fieldMetadataUniversalIdentifier: AMOUNT_FIELD_UID,
  direction: ViewSortDirection.DESC,
};

const NULLABLE_VIEW_MANIFEST_PROPERTIES: (keyof ViewManifest)[] = [
  'mainGroupByFieldMetadataUniversalIdentifier',
  'anyFieldFilterValue',
  'kanbanColumnWidth',
  'kanbanAggregateOperation',
  'kanbanAggregateOperationFieldMetadataUniversalIdentifier',
  'calendarLayout',
  'calendarFieldMetadataUniversalIdentifier',
  'calendarEndFieldMetadataUniversalIdentifier',
];

const VIEW_CHILD_COLLECTION_PROPERTIES_OTHER_THAN_FIELDS: (keyof ViewManifest)[] =
  ['filters', 'filterGroups', 'groups', 'fieldGroups', 'sorts'];

const forward = (viewManifest: ViewManifest) =>
  fromViewManifestToUniversalFlatView({
    viewManifest,
    applicationUniversalIdentifier: APP_UID,
    now: NOW,
  });

const roundTripFlatView = (flatView: UniversalFlatView) =>
  compareTwoFlatEntity({
    fromUniversalFlatEntity: flatView,
    toUniversalFlatEntity: forward(fromFlatViewToViewManifest({ flatView })),
    metadataName: 'view',
  });

describe('fromFlatViewToViewManifest', () => {
  it('should reproduce the manifest after a forward then an inverse conversion', () => {
    expect(
      fromFlatViewToViewManifest({ flatView: forward(VIEW_MANIFEST) }),
    ).toEqual(VIEW_MANIFEST);
  });

  it('should reproduce the flat entity after an inverse then a forward conversion', () => {
    const flatView: UniversalFlatView = {
      universalIdentifier: VIEW_UID,
      applicationUniversalIdentifier: APP_UID,
      name: 'Agenda',
      objectMetadataUniversalIdentifier: OBJECT_UID,
      type: ViewType.CALENDAR,
      icon: 'IconCalendar',
      position: 1,
      isCompact: false,
      isCustom: false,
      visibility: ViewVisibility.WORKSPACE,
      openRecordIn: ViewOpenRecordIn.SIDE_PANEL,
      key: ViewKey.INDEX,
      kanbanAggregateOperation: null,
      kanbanAggregateOperationFieldMetadataUniversalIdentifier: null,
      calendarLayout: ViewCalendarLayout.MONTH,
      calendarFieldMetadataUniversalIdentifier: START_DATE_FIELD_UID,
      calendarEndFieldMetadataUniversalIdentifier: null,
      mainGroupByFieldMetadataUniversalIdentifier: null,
      shouldHideEmptyGroups: false,
      kanbanColumnWidth: null,
      anyFieldFilterValue: null,
      createdByUserWorkspaceId: null,
      isActive: true,
      isSystemSideEffect: false,
      universalOverrides: null,
      viewFieldUniversalIdentifiers: [],
      viewFilterUniversalIdentifiers: [],
      viewFilterGroupUniversalIdentifiers: [],
      viewGroupUniversalIdentifiers: [],
      viewFieldGroupUniversalIdentifiers: [],
      viewSortUniversalIdentifiers: [],
      createdAt: NOW,
      updatedAt: NOW,
      deletedAt: null,
    };

    expect(roundTripFlatView(flatView)).toBeUndefined();
  });

  it('should write the defaults the forward converter applied to a minimal manifest', () => {
    const viewManifest = fromFlatViewToViewManifest({
      flatView: forward(MINIMAL_VIEW_MANIFEST),
    });

    expect(viewManifest).toEqual({
      ...MINIMAL_VIEW_MANIFEST,
      type: ViewType.TABLE,
      icon: 'IconList',
      position: 0,
      isCompact: false,
      visibility: ViewVisibility.WORKSPACE,
      openRecordIn: ViewOpenRecordIn.SIDE_PANEL,
      shouldHideEmptyGroups: false,
    });
    for (const property of NULLABLE_VIEW_MANIFEST_PROPERTIES) {
      expect(viewManifest).not.toHaveProperty(property);
    }
  });

  it('should emit the provided children and omit the empty child collections', () => {
    const viewManifest = fromFlatViewToViewManifest({
      flatView: forward(VIEW_MANIFEST),
      children: {
        fields: [VIEW_FIELD_MANIFEST],
        filters: [],
        filterGroups: [],
        groups: [],
        fieldGroups: [],
        sorts: [],
      },
    });

    expect(viewManifest.fields).toEqual([VIEW_FIELD_MANIFEST]);
    for (const property of VIEW_CHILD_COLLECTION_PROPERTIES_OTHER_THAN_FIELDS) {
      expect(viewManifest).not.toHaveProperty(property);
    }
  });

  it('should emit every non-empty child collection under its own key', () => {
    const children = {
      fields: [VIEW_FIELD_MANIFEST],
      filters: [VIEW_FILTER_MANIFEST],
      filterGroups: [VIEW_FILTER_GROUP_MANIFEST],
      groups: [VIEW_GROUP_MANIFEST],
      fieldGroups: [VIEW_FIELD_GROUP_MANIFEST],
      sorts: [VIEW_SORT_MANIFEST],
    };

    expect(
      fromFlatViewToViewManifest({
        flatView: forward(VIEW_MANIFEST),
        children,
      }),
    ).toEqual({ ...VIEW_MANIFEST, ...children });
  });

  it('should never emit the key even when the flat view carries one', () => {
    expect(
      fromFlatViewToViewManifest({
        flatView: { ...forward(VIEW_MANIFEST), key: ViewKey.INDEX },
      }),
    ).not.toHaveProperty('key');
  });
});
