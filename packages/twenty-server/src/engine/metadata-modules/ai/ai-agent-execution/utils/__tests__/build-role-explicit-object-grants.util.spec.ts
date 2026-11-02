import { buildExplicitObjectPermissionByObjectId } from 'src/engine/core-modules/tool-provider/utils/build-explicit-object-permission-by-object-id.util';
import { buildRoleExplicitObjectGrants } from 'src/engine/metadata-modules/ai/ai-agent-execution/utils/build-role-explicit-object-grants.util';

const ROLE_WITHOUT_ROLE_WIDE_GRANTS = {
  id: 'agent-role-id',
  canReadAllObjectRecords: false,
  canUpdateAllObjectRecords: false,
  canSoftDeleteAllObjectRecords: false,
  canDestroyAllObjectRecords: false,
};

describe('buildRoleExplicitObjectGrants', () => {
  it('keeps only the rows of the role, without null values', () => {
    expect(
      buildRoleExplicitObjectGrants({
        role: ROLE_WITHOUT_ROLE_WIDE_GRANTS,
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
      canReadAllObjectRecords: false,
      canUpdateAllObjectRecords: false,
      canSoftDeleteAllObjectRecords: false,
      canDestroyAllObjectRecords: false,
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

  it('hands an agent whose role reads every object tools to read each of them', () => {
    const explicitPermissionByObjectId =
      buildExplicitObjectPermissionByObjectId({
        explicitObjectGrants: buildRoleExplicitObjectGrants({
          role: {
            ...ROLE_WITHOUT_ROLE_WIDE_GRANTS,
            canReadAllObjectRecords: true,
          },
          flatObjectPermissionMaps: { byUniversalIdentifier: {} },
        }),
        flatObjectMetadataMaps: {
          byUniversalIdentifier: {
            person: { id: 'person-id', universalIdentifier: 'person' },
            company: { id: 'company-id', universalIdentifier: 'company' },
          } as never,
        },
      });

    expect([...explicitPermissionByObjectId.keys()]).toEqual([
      'person-id',
      'company-id',
    ]);
    expect(explicitPermissionByObjectId.get('person-id')).toEqual({
      canReadObjectRecords: true,
      canUpdateObjectRecords: false,
      canSoftDeleteObjectRecords: false,
      canDestroyObjectRecords: false,
    });
  });
});
