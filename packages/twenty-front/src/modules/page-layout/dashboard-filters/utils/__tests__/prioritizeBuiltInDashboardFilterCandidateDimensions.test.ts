import { type DashboardFilterCandidateDimension } from '@/page-layout/dashboard-filters/types/DashboardFilterCandidateDimension';
import { prioritizeBuiltInDashboardFilterCandidateDimensions } from '@/page-layout/dashboard-filters/utils/prioritizeBuiltInDashboardFilterCandidateDimensions';

const WORKSPACE_MEMBER_OBJECT_METADATA_ID = 'workspace-member-object-id';

const NAME_DIMENSION: DashboardFilterCandidateDimension = {
  key: 'field:name:TEXT',
  label: 'Name',
  icon: null,
  filterType: 'TEXT',
  proposedBindingsByWidgetId: {
    'company-widget': { fieldMetadataId: 'name-field-id' },
    'person-widget': { fieldMetadataId: 'person-name-field-id' },
  },
};

const CREATED_AT_DIMENSION: DashboardFilterCandidateDimension = {
  key: 'field:createdAt:DATE_TIME',
  label: 'Creation date',
  icon: null,
  filterType: 'DATE_TIME',
  proposedBindingsByWidgetId: {
    'company-widget': { fieldMetadataId: 'created-at-field-id' },
  },
};

const WORKSPACE_MEMBER_DIMENSION: DashboardFilterCandidateDimension = {
  key: `relation-target:${WORKSPACE_MEMBER_OBJECT_METADATA_ID}`,
  label: 'Workspace Member',
  icon: null,
  filterType: 'RELATION',
  relationTargetObjectMetadataId: WORKSPACE_MEMBER_OBJECT_METADATA_ID,
  proposedBindingsByWidgetId: {
    'company-widget': { fieldMetadataId: 'account-owner-field-id' },
  },
};

describe('prioritizeBuiltInDashboardFilterCandidateDimensions', () => {
  it('moves the built-in equivalents first under the built-in labels', () => {
    expect(
      prioritizeBuiltInDashboardFilterCandidateDimensions({
        dimensions: [
          NAME_DIMENSION,
          WORKSPACE_MEMBER_DIMENSION,
          CREATED_AT_DIMENSION,
        ],
        workspaceMemberObjectMetadataId: WORKSPACE_MEMBER_OBJECT_METADATA_ID,
        dateLabel: 'Date',
        ownerLabel: 'Owner',
      }),
    ).toEqual([
      { ...CREATED_AT_DIMENSION, label: 'Date' },
      { ...WORKSPACE_MEMBER_DIMENSION, label: 'Owner' },
      NAME_DIMENSION,
    ]);
  });

  it('stops promoting a built-in once a slot equivalent to it exists', () => {
    expect(
      prioritizeBuiltInDashboardFilterCandidateDimensions({
        dimensions: [
          NAME_DIMENSION,
          WORKSPACE_MEMBER_DIMENSION,
          CREATED_AT_DIMENSION,
        ],
        workspaceMemberObjectMetadataId: WORKSPACE_MEMBER_OBJECT_METADATA_ID,
        dateLabel: 'Date',
        ownerLabel: 'Owner',
        hasDateEquivalentSlot: true,
      }),
    ).toEqual([
      { ...WORKSPACE_MEMBER_DIMENSION, label: 'Owner' },
      NAME_DIMENSION,
      CREATED_AT_DIMENSION,
    ]);

    expect(
      prioritizeBuiltInDashboardFilterCandidateDimensions({
        dimensions: [
          NAME_DIMENSION,
          WORKSPACE_MEMBER_DIMENSION,
          CREATED_AT_DIMENSION,
        ],
        workspaceMemberObjectMetadataId: WORKSPACE_MEMBER_OBJECT_METADATA_ID,
        dateLabel: 'Date',
        ownerLabel: 'Owner',
        hasDateEquivalentSlot: true,
        hasOwnerEquivalentSlot: true,
      }),
    ).toEqual([
      NAME_DIMENSION,
      WORKSPACE_MEMBER_DIMENSION,
      CREATED_AT_DIMENSION,
    ]);
  });

  it('keeps the list as is when no built-in equivalent exists', () => {
    expect(
      prioritizeBuiltInDashboardFilterCandidateDimensions({
        dimensions: [NAME_DIMENSION],
        workspaceMemberObjectMetadataId: undefined,
        dateLabel: 'Date',
        ownerLabel: 'Owner',
      }),
    ).toEqual([NAME_DIMENSION]);
  });
});
