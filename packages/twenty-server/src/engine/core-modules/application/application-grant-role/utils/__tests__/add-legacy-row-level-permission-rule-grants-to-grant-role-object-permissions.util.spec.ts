import { addLegacyRowLevelPermissionRuleGrantsToGrantRoleObjectPermissions } from 'src/engine/core-modules/application/application-grant-role/utils/add-legacy-row-level-permission-rule-grants-to-grant-role-object-permissions.util';

const FLAT_OBJECT_PERMISSION_WITHOUT_GRANTS = {
  canReadObjectRecords: false,
  canCreateObjectRecords: false,
  canUpdateObjectRecords: false,
  canSoftDeleteObjectRecords: false,
  canDestroyObjectRecords: false,
};
const FLAT_ROW_LEVEL_PERMISSION_RULE_WITHOUT_GRANTS = {
  canReadRecords: false,
  canCreateRecords: false,
  canUpdateRecords: false,
  canSoftDeleteRecords: false,
  canDestroyRecords: false,
};

const buildGrantRoleFlatObjectPermission = ({
  objectMetadataUniversalIdentifier,
  grants,
}: {
  objectMetadataUniversalIdentifier: string;
  grants:
    | typeof FLAT_OBJECT_PERMISSION_WITHOUT_GRANTS
    | Record<
        keyof typeof FLAT_OBJECT_PERMISSION_WITHOUT_GRANTS,
        boolean | null
      >;
}) => ({ objectMetadataUniversalIdentifier, isAdded: true, ...grants });

describe('addLegacyRowLevelPermissionRuleGrantsToGrantRoleObjectPermissions', () => {
  it('should grant on all records every operation a rule of the object grants', () => {
    expect(
      addLegacyRowLevelPermissionRuleGrantsToGrantRoleObjectPermissions({
        grantRoleFlatObjectPermissions: [
          {
            objectMetadataUniversalIdentifier: 'company',
            isAdded: false,
            ...FLAT_OBJECT_PERMISSION_WITHOUT_GRANTS,
          },
          {
            objectMetadataUniversalIdentifier: 'person',
            isAdded: false,
            ...FLAT_OBJECT_PERMISSION_WITHOUT_GRANTS,
          },
        ],
        requestedRoleFlatRowLevelPermissionRules: [
          {
            ...FLAT_ROW_LEVEL_PERMISSION_RULE_WITHOUT_GRANTS,
            objectMetadataUniversalIdentifier: 'company',
            canReadRecords: true,
          },
          {
            ...FLAT_ROW_LEVEL_PERMISSION_RULE_WITHOUT_GRANTS,
            objectMetadataUniversalIdentifier: 'company',
            canUpdateRecords: true,
          },
        ],
        buildGrantRoleFlatObjectPermission,
      }),
    ).toEqual([
      {
        objectMetadataUniversalIdentifier: 'company',
        isAdded: false,
        ...FLAT_OBJECT_PERMISSION_WITHOUT_GRANTS,
        canReadObjectRecords: true,
        canUpdateObjectRecords: true,
      },
      {
        objectMetadataUniversalIdentifier: 'person',
        isAdded: false,
        ...FLAT_OBJECT_PERMISSION_WITHOUT_GRANTS,
      },
    ]);
  });

  it('should add an object permission only for a rule that grants, leaving the other operations to their default', () => {
    expect(
      addLegacyRowLevelPermissionRuleGrantsToGrantRoleObjectPermissions({
        grantRoleFlatObjectPermissions: [],
        requestedRoleFlatRowLevelPermissionRules: [
          {
            ...FLAT_ROW_LEVEL_PERMISSION_RULE_WITHOUT_GRANTS,
            objectMetadataUniversalIdentifier: 'company',
            canReadRecords: true,
          },
          {
            ...FLAT_ROW_LEVEL_PERMISSION_RULE_WITHOUT_GRANTS,
            objectMetadataUniversalIdentifier: 'person',
          },
        ],
        buildGrantRoleFlatObjectPermission,
      }),
    ).toEqual([
      {
        objectMetadataUniversalIdentifier: 'company',
        isAdded: true,
        canReadObjectRecords: true,
        canCreateObjectRecords: null,
        canUpdateObjectRecords: null,
        canSoftDeleteObjectRecords: null,
        canDestroyObjectRecords: null,
      },
    ]);
  });
});
