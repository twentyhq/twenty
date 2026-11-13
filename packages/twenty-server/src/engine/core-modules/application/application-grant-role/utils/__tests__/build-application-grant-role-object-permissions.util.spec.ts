import { buildApplicationGrantRoleObjectPermissions } from 'src/engine/core-modules/application/application-grant-role/utils/build-application-grant-role-object-permissions.util';

const FLAT_OBJECT_PERMISSION_WITHOUT_GRANTS = {
  canReadObjectRecords: false,
  canCreateObjectRecords: false,
  canUpdateObjectRecords: false,
  canSoftDeleteObjectRecords: false,
  canDestroyObjectRecords: false,
};
const FLAT_ROLE_WITHOUT_GRANTS = {
  canReadAllObjectRecords: false,
  canCreateAllObjectRecords: false,
  canUpdateAllObjectRecords: false,
  canSoftDeleteAllObjectRecords: false,
  canDestroyAllObjectRecords: false,
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

describe('buildApplicationGrantRoleObjectPermissions', () => {
  it('should grant on all records every operation a rule of the object grants', () => {
    expect(
      buildApplicationGrantRoleObjectPermissions({
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
        requestedFlatRole: FLAT_ROLE_WITHOUT_GRANTS,
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

  it('should add an object permission for a rule on an object that has none, keeping the role grants', () => {
    expect(
      buildApplicationGrantRoleObjectPermissions({
        grantRoleFlatObjectPermissions: [],
        requestedRoleFlatRowLevelPermissionRules: [
          {
            ...FLAT_ROW_LEVEL_PERMISSION_RULE_WITHOUT_GRANTS,
            objectMetadataUniversalIdentifier: 'company',
            canReadRecords: true,
          },
        ],
        requestedFlatRole: {
          ...FLAT_ROLE_WITHOUT_GRANTS,
          canDestroyAllObjectRecords: true,
        },
        buildGrantRoleFlatObjectPermission,
      }),
    ).toEqual([
      {
        objectMetadataUniversalIdentifier: 'company',
        isAdded: true,
        ...FLAT_OBJECT_PERMISSION_WITHOUT_GRANTS,
        canReadObjectRecords: true,
        canDestroyObjectRecords: true,
      },
    ]);
  });
});
