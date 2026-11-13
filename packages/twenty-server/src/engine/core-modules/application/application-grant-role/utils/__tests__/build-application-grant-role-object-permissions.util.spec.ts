import { buildApplicationGrantRoleObjectPermissions } from 'src/engine/core-modules/application/application-grant-role/utils/build-application-grant-role-object-permissions.util';

const NO_GRANTS = {
  canReadObjectRecords: false,
  canCreateObjectRecords: false,
  canUpdateObjectRecords: false,
  canSoftDeleteObjectRecords: false,
  canDestroyObjectRecords: false,
};
const NO_ROLE_GRANTS = {
  canReadAllObjectRecords: false,
  canCreateAllObjectRecords: false,
  canUpdateAllObjectRecords: false,
  canSoftDeleteAllObjectRecords: false,
  canDestroyAllObjectRecords: false,
};
const NO_RULE_GRANTS = {
  canReadRecords: false,
  canCreateRecords: false,
  canUpdateRecords: false,
  canSoftDeleteRecords: false,
  canDestroyRecords: false,
};

const buildObjectPermission = ({
  objectMetadataUniversalIdentifier,
  grants,
}: {
  objectMetadataUniversalIdentifier: string;
  grants: typeof NO_GRANTS | Record<keyof typeof NO_GRANTS, boolean | null>;
}) => ({ objectMetadataUniversalIdentifier, isAdded: true, ...grants });

describe('buildApplicationGrantRoleObjectPermissions', () => {
  it('should grant on all records every operation a rule of the object grants', () => {
    expect(
      buildApplicationGrantRoleObjectPermissions({
        objectPermissions: [
          {
            objectMetadataUniversalIdentifier: 'company',
            isAdded: false,
            ...NO_GRANTS,
          },
          {
            objectMetadataUniversalIdentifier: 'person',
            isAdded: false,
            ...NO_GRANTS,
          },
        ],
        rules: [
          {
            ...NO_RULE_GRANTS,
            objectMetadataUniversalIdentifier: 'company',
            canReadRecords: true,
          },
          {
            ...NO_RULE_GRANTS,
            objectMetadataUniversalIdentifier: 'company',
            canUpdateRecords: true,
          },
        ],
        roleGrants: NO_ROLE_GRANTS,
        buildObjectPermission,
      }),
    ).toEqual([
      {
        objectMetadataUniversalIdentifier: 'company',
        isAdded: false,
        ...NO_GRANTS,
        canReadObjectRecords: true,
        canUpdateObjectRecords: true,
      },
      {
        objectMetadataUniversalIdentifier: 'person',
        isAdded: false,
        ...NO_GRANTS,
      },
    ]);
  });

  it('should add an object permission for a rule on an object that has none, keeping the role grants', () => {
    expect(
      buildApplicationGrantRoleObjectPermissions({
        objectPermissions: [],
        rules: [
          {
            ...NO_RULE_GRANTS,
            objectMetadataUniversalIdentifier: 'company',
            canReadRecords: true,
          },
        ],
        roleGrants: { ...NO_ROLE_GRANTS, canDestroyAllObjectRecords: true },
        buildObjectPermission,
      }),
    ).toEqual([
      {
        objectMetadataUniversalIdentifier: 'company',
        isAdded: true,
        ...NO_GRANTS,
        canReadObjectRecords: true,
        canDestroyObjectRecords: true,
      },
    ]);
  });
});
