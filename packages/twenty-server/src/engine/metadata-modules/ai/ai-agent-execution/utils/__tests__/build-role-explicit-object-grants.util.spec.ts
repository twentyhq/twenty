import { buildRoleExplicitObjectGrants } from 'src/engine/metadata-modules/ai/ai-agent-execution/utils/build-role-explicit-object-grants.util';

describe('buildRoleExplicitObjectGrants', () => {
  it('keeps only the rows of the role, without null values', () => {
    expect(
      buildRoleExplicitObjectGrants({
        roleId: 'agent-role-id',
        flatObjectPermissionMaps: {
          byUniversalIdentifier: {
            'agent-person': {
              roleId: 'agent-role-id',
              objectMetadataUniversalIdentifier: 'person',
              canReadObjectRecords: true,
              canUpdateObjectRecords: null,
              canSoftDeleteObjectRecords: null,
              canDestroyObjectRecords: null,
            },
            'member-company': {
              roleId: 'member-role-id',
              objectMetadataUniversalIdentifier: 'company',
              canReadObjectRecords: true,
              canUpdateObjectRecords: true,
              canSoftDeleteObjectRecords: true,
              canDestroyObjectRecords: true,
            },
          },
        },
      }),
    ).toEqual({
      objectPermissions: [
        {
          objectUniversalIdentifier: 'person',
          canReadObjectRecords: true,
          canUpdateObjectRecords: undefined,
          canSoftDeleteObjectRecords: undefined,
          canDestroyObjectRecords: undefined,
        },
      ],
    });
  });
});
