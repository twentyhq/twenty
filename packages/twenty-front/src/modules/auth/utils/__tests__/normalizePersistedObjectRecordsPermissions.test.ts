import { normalizePersistedObjectRecordsPermissions } from '@/auth/utils/normalizePersistedObjectRecordsPermissions';

const OBJECT_RECORDS_PERMISSIONS = {
  objectMetadataId: 'company-object-metadata-id',
  canCreateAllRecords: false,
  canReadAllRecords: false,
  canUpdateAllRecords: false,
  canSoftDeleteAllRecords: false,
  canDestroyAllRecords: false,
  unreadableFields: [],
  uneditableFields: [],
};

const ROW_LEVEL_RECORDS_PERMISSIONS = {
  ruleId: 'rule-id',
  canCreateRecords: false,
  canReadRecords: true,
  canUpdateRecords: false,
  canSoftDeleteRecords: false,
  canDestroyRecords: false,
  predicates: [],
  predicateGroups: [],
  unreadableFields: [],
  uneditableFields: [],
};

describe('normalizePersistedObjectRecordsPermissions', () => {
  it('should keep row level permissions persisted as a list', () => {
    expect(
      normalizePersistedObjectRecordsPermissions({
        ...OBJECT_RECORDS_PERMISSIONS,
        rowLevelRecordsPermissions: [ROW_LEVEL_RECORDS_PERMISSIONS],
      }).rowLevelRecordsPermissions,
    ).toEqual([ROW_LEVEL_RECORDS_PERMISSIONS]);
  });

  it('should drop row level permissions persisted before 2.58 as a single rule', () => {
    expect(
      normalizePersistedObjectRecordsPermissions({
        ...OBJECT_RECORDS_PERMISSIONS,
        rowLevelRecordsPermissions: {
          canReadRecords: true,
          predicates: [],
          predicateGroups: [],
        },
      }).rowLevelRecordsPermissions,
    ).toBeNull();
  });
});
