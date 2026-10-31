import { buildRoleExplicitObjectGrants } from 'src/engine/metadata-modules/ai/ai-agent-execution/utils/build-role-explicit-object-grants.util';
import { type FlatObjectPermission } from 'src/engine/metadata-modules/flat-object-permission/types/flat-object-permission.type';

const buildFlatObjectPermission = (
  flatObjectPermission: Pick<
    FlatObjectPermission,
    | 'roleId'
    | 'objectMetadataUniversalIdentifier'
    | 'canReadObjectRecords'
    | 'canUpdateObjectRecords'
  >,
) => flatObjectPermission as FlatObjectPermission;

describe('buildRoleExplicitObjectGrants', () => {
  it('keeps only the rows of the role, without null values', () => {
    expect(
      buildRoleExplicitObjectGrants({
        roleId: 'agent-role-id',
        flatObjectPermissionMaps: {
          byUniversalIdentifier: {
            'agent-person': buildFlatObjectPermission({
              roleId: 'agent-role-id',
              objectMetadataUniversalIdentifier: 'person',
              canReadObjectRecords: true,
              canUpdateObjectRecords: null,
            }),
            'member-company': buildFlatObjectPermission({
              roleId: 'member-role-id',
              objectMetadataUniversalIdentifier: 'company',
              canReadObjectRecords: true,
              canUpdateObjectRecords: true,
            }),
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
