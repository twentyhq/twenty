import { findNavigationMenuItemForRecord } from '@/navigation-menu-item/common/utils/findNavigationMenuItemForRecord';

const WORKFLOW_OBJECT_METADATA_ID = 'workflow-object-metadata-id';

const coreIdFavorite = {
  targetRecordId: 'core-workflow-id',
  targetObjectMetadataId: WORKFLOW_OBJECT_METADATA_ID,
  targetRecordIdentifier: { id: 'core-workflow-id', labelIdentifier: 'Flow' },
};

const legacyIdFavorite = {
  targetRecordId: 'workspace-workflow-id',
  targetObjectMetadataId: WORKFLOW_OBJECT_METADATA_ID,
  targetRecordIdentifier: { id: 'core-workflow-id', labelIdentifier: 'Flow' },
};

describe('findNavigationMenuItemForRecord', () => {
  it('finds a favorite storing the record id', () => {
    expect(
      findNavigationMenuItemForRecord({
        navigationMenuItems: [coreIdFavorite],
        recordId: 'core-workflow-id',
        objectMetadataId: WORKFLOW_OBJECT_METADATA_ID,
      }),
    ).toBe(coreIdFavorite);
  });

  it('finds a legacy favorite through its resolved identifier', () => {
    expect(
      findNavigationMenuItemForRecord({
        navigationMenuItems: [legacyIdFavorite],
        recordId: 'core-workflow-id',
        objectMetadataId: WORKFLOW_OBJECT_METADATA_ID,
      }),
    ).toBe(legacyIdFavorite);
  });

  it('does not match a favorite of another object', () => {
    expect(
      findNavigationMenuItemForRecord({
        navigationMenuItems: [coreIdFavorite],
        recordId: 'core-workflow-id',
        objectMetadataId: 'company-object-metadata-id',
      }),
    ).toBeUndefined();
  });

  it('does not match an unrelated record', () => {
    expect(
      findNavigationMenuItemForRecord({
        navigationMenuItems: [coreIdFavorite, legacyIdFavorite],
        recordId: 'another-core-workflow-id',
        objectMetadataId: WORKFLOW_OBJECT_METADATA_ID,
      }),
    ).toBeUndefined();
  });
});
