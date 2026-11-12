import { getRoleDirtyFields } from '@/settings/roles/role/utils/getRoleDirtyFields';
import { RowLevelPermissionPredicateOperand } from '~/generated-metadata/graphql';
import { mockedRoles } from '~/testing/mock-data/generated/metadata/roles/mock-roles-data';

const role = { ...mockedRoles[1], permissionFlags: [] };
const draftFlag = {
  id: 'temporary-id',
  roleId: role.id,
  flag: 'APP_SEND_NOTIFICATION',
};
const draftRole = { ...role, permissionFlags: [draftFlag] };
const savedRole = {
  ...role,
  permissionFlags: [
    {
      ...draftFlag,
      id: 'server-id',
      __typename: 'RolePermissionFlag' as const,
    },
  ],
};

describe('getRoleDirtyFields', () => {
  it('treats saved flags as clean despite generated IDs and GraphQL metadata', () => {
    expect(getRoleDirtyFields(draftRole, savedRole)).toEqual({});
  });

  it('ignores flag ordering without modifying either role', () => {
    const otherFlag = { ...draftFlag, id: 'other-id', flag: 'APP_CONFIGURE' };
    const draft = { ...role, permissionFlags: [draftFlag, otherFlag] };
    const persisted = { ...role, permissionFlags: [otherFlag, draftFlag] };

    expect(getRoleDirtyFields(draft, persisted)).toEqual({});
    expect(draft.permissionFlags).toEqual([draftFlag, otherFlag]);
    expect(persisted.permissionFlags).toEqual([otherFlag, draftFlag]);
  });

  it('keeps additions made during a save dirty until they are undone', () => {
    const otherFlag = { ...draftFlag, id: 'other-id', flag: 'APP_CONFIGURE' };
    const draft = { ...draftRole, permissionFlags: [draftFlag, otherFlag] };

    expect(getRoleDirtyFields(draft, savedRole)).toEqual({
      permissionFlags: draft.permissionFlags,
    });
    expect(getRoleDirtyFields(draftRole, savedRole)).toEqual({});
  });

  it('detects flag removals and replacements', () => {
    expect(getRoleDirtyFields(role, savedRole)).toEqual({
      permissionFlags: [],
    });
    const replacement = { ...draftFlag, flag: 'APP_CONFIGURE' };
    expect(
      getRoleDirtyFields(
        { ...role, permissionFlags: [replacement] },
        savedRole,
      ),
    ).toEqual({ permissionFlags: [replacement] });
  });

  it('keeps failed flag changes and unrelated edits dirty', () => {
    expect(getRoleDirtyFields(draftRole, role)).toEqual({
      permissionFlags: [draftFlag],
    });
    expect(
      getRoleDirtyFields({ ...draftRole, label: 'Unsaved label' }, savedRole),
    ).toEqual({ label: 'Unsaved label' });
  });

  it('retains new-role fields when there is no persisted role', () => {
    expect(getRoleDirtyFields(draftRole, undefined)).toEqual(draftRole);
  });

  it('treats a saved rule as clean despite the rule list and grants the server derives', () => {
    const predicate = {
      id: 'predicate-id',
      fieldMetadataId: 'field-id',
      relationFieldMetadataId: null,
      objectMetadataId: 'pet',
      operand: RowLevelPermissionPredicateOperand.IS,
      roleId: role.id,
      value: '3',
    };
    const draft = {
      ...role,
      canReadAllObjectRecords: true,
      objectPermissions: [
        { objectMetadataId: 'pet', canReadObjectRecords: true },
      ],
      rowLevelPermissionPredicates: [predicate],
    };
    const persisted = {
      ...draft,
      objectPermissions: [
        { objectMetadataId: 'pet', canReadObjectRecords: null },
      ],
      rowLevelPermissionRules: [
        {
          __typename: 'RowLevelPermissionRule' as const,
          id: 'rule-id',
          objectMetadataId: 'pet',
          canCreateRecords: false,
          canReadRecords: true,
          canUpdateRecords: false,
          canSoftDeleteRecords: false,
          canDestroyRecords: false,
        },
      ],
    };

    expect(getRoleDirtyFields(draft, persisted)).toEqual({});

    const otherPredicate = { ...predicate, id: 'other-predicate-id' };

    expect(
      getRoleDirtyFields(
        { ...draft, rowLevelPermissionPredicates: [predicate, otherPredicate] },
        {
          ...persisted,
          rowLevelPermissionPredicates: [otherPredicate, predicate],
        },
      ),
    ).toEqual({});
    expect(
      Object.keys(
        getRoleDirtyFields(
          {
            ...draft,
            objectPermissions: [
              { objectMetadataId: 'pet', canReadObjectRecords: false },
            ],
          },
          persisted,
        ),
      ),
    ).toEqual(['objectPermissions']);
  });

  it('treats a saved field restriction as clean despite its generated ID', () => {
    const buildRole = ({
      fieldPermissionId,
      canReadFieldValue,
    }: {
      fieldPermissionId: string;
      canReadFieldValue: boolean | null;
    }) => ({
      ...role,
      fieldPermissions: [
        {
          id: fieldPermissionId,
          roleId: role.id,
          objectMetadataId: 'pet',
          fieldMetadataId: 'bio',
          canReadFieldValue,
          canUpdateFieldValue: false,
        },
      ],
    });
    const savedRoleWithUneditableField = buildRole({
      fieldPermissionId: 'server-id',
      canReadFieldValue: null,
    });

    expect(
      getRoleDirtyFields(
        buildRole({
          fieldPermissionId: 'temporary-id',
          canReadFieldValue: null,
        }),
        savedRoleWithUneditableField,
      ),
    ).toEqual({});
    expect(
      Object.keys(
        getRoleDirtyFields(
          buildRole({
            fieldPermissionId: 'temporary-id',
            canReadFieldValue: false,
          }),
          savedRoleWithUneditableField,
        ),
      ),
    ).toEqual(['fieldPermissions']);
  });
});
