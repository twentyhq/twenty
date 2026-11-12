import { describe, expect, it } from 'vitest';

import { fromRoleConfigToRoleManifest } from '@/app/manifest/utils/from-role-config-to-role-manifest';
import { type RoleConfig } from '@/app/manifest/types/role-config.type';
import { RowLevelPermissionPredicateOperand } from 'twenty-shared/types';
import { getObjectPermissionUniversalIdentifier } from 'twenty-shared/application';

const APPLICATION_UNIVERSAL_IDENTIFIER = '5a0c6f3e-8d2b-4c1a-9e7f-3b4d5c6e7f80';
const ROLE_UNIVERSAL_IDENTIFIER = 'c3c1dc2e-1a08-4de5-abb7-2139b3d99343';
const OBJECT_UNIVERSAL_IDENTIFIER = '39101b39-1c16-4148-9e82-45dc271bb90d';
const FIELD_UNIVERSAL_IDENTIFIER = '0e49f2e4-1e45-433d-bf49-79acc0b06d0e';
const PREDICATE_UNIVERSAL_IDENTIFIER = '22222222-0000-4000-8000-000000000000';
const OBJECT_PERMISSION_UNIVERSAL_IDENTIFIER =
  '33333333-0000-4000-8000-000000000000';
const FIELD_PERMISSION_UNIVERSAL_IDENTIFIER =
  '44444444-0000-4000-8000-000000000000';

const DERIVED_OBJECT_PERMISSION_UNIVERSAL_IDENTIFIER =
  getObjectPermissionUniversalIdentifier({
    applicationUniversalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
    roleUniversalIdentifier: ROLE_UNIVERSAL_IDENTIFIER,
    objectUniversalIdentifier: OBJECT_UNIVERSAL_IDENTIFIER,
  });

const baseConfig: RoleConfig = {
  universalIdentifier: ROLE_UNIVERSAL_IDENTIFIER,
  label: 'Partner',
};

const convert = (roleConfig: RoleConfig) =>
  fromRoleConfigToRoleManifest({
    roleConfig,
    applicationUniversalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
  });

describe('fromRoleConfigToRoleManifest', () => {
  it('derives the universalIdentifier of an object of recordsPermissions that omits it', () => {
    const manifest = convert({
      ...baseConfig,
      recordsPermissions: {
        canReadAllRecords: true,
        objects: [
          {
            objectUniversalIdentifier: OBJECT_UNIVERSAL_IDENTIFIER,
            canUpdateAllRecords: true,
            unreadableFields: [FIELD_UNIVERSAL_IDENTIFIER],
          },
        ],
      },
    });

    expect(manifest).toStrictEqual({
      ...baseConfig,
      recordsPermissions: {
        canReadAllRecords: true,
        objects: [
          {
            universalIdentifier: DERIVED_OBJECT_PERMISSION_UNIVERSAL_IDENTIFIER,
            objectUniversalIdentifier: OBJECT_UNIVERSAL_IDENTIFIER,
            canUpdateAllRecords: true,
            unreadableFields: [FIELD_UNIVERSAL_IDENTIFIER],
          },
        ],
      },
      permissionFlagUniversalIdentifiers: [],
    });
  });

  it('converts the deprecated properties into recordsPermissions and keeps the identifiers they provide', () => {
    const manifest = convert({
      ...baseConfig,
      canReadAllObjectRecords: true,
      objectPermissions: [
        {
          universalIdentifier: OBJECT_PERMISSION_UNIVERSAL_IDENTIFIER,
          objectUniversalIdentifier: OBJECT_UNIVERSAL_IDENTIFIER,
          canUpdateObjectRecords: true,
        },
      ],
      fieldPermissions: [
        {
          universalIdentifier: FIELD_PERMISSION_UNIVERSAL_IDENTIFIER,
          objectUniversalIdentifier: OBJECT_UNIVERSAL_IDENTIFIER,
          fieldUniversalIdentifier: FIELD_UNIVERSAL_IDENTIFIER,
          canUpdateFieldValue: false,
        },
      ],
    });

    expect(manifest).toStrictEqual({
      ...baseConfig,
      recordsPermissions: {
        canReadAllRecords: true,
        objects: [
          {
            universalIdentifier: OBJECT_PERMISSION_UNIVERSAL_IDENTIFIER,
            objectUniversalIdentifier: OBJECT_UNIVERSAL_IDENTIFIER,
            canUpdateAllRecords: true,
            uneditableFields: [FIELD_UNIVERSAL_IDENTIFIER],
            fieldPermissionIdentifiers: [
              {
                fieldUniversalIdentifier: FIELD_UNIVERSAL_IDENTIFIER,
                universalIdentifier: FIELD_PERMISSION_UNIVERSAL_IDENTIFIER,
              },
            ],
          },
        ],
      },
      permissionFlagUniversalIdentifiers: [],
    });
  });

  it('converts predicates declared on the role into a rule of their object', () => {
    const manifest = convert({
      ...baseConfig,
      objectPermissions: [
        {
          objectUniversalIdentifier: OBJECT_UNIVERSAL_IDENTIFIER,
          canReadObjectRecords: true,
        },
      ],
      rowLevelPermissionPredicates: [
        {
          universalIdentifier: PREDICATE_UNIVERSAL_IDENTIFIER,
          objectUniversalIdentifier: OBJECT_UNIVERSAL_IDENTIFIER,
          fieldUniversalIdentifier: FIELD_UNIVERSAL_IDENTIFIER,
          operand: RowLevelPermissionPredicateOperand.IS,
        },
      ],
    });

    expect(manifest).not.toHaveProperty('rowLevelPermissionPredicates');
    expect(manifest.recordsPermissions?.objects).toMatchObject([
      {
        objectUniversalIdentifier: OBJECT_UNIVERSAL_IDENTIFIER,
        canReadAllRecords: false,
        rowLevelRecordsPermissions: [
          {
            canReadRecords: true,
            predicates: [
              { universalIdentifier: PREDICATE_UNIVERSAL_IDENTIFIER },
            ],
          },
        ],
      },
    ]);
  });

  it('writes an empty recordsPermissions for a role that declares none', () => {
    expect(convert(baseConfig)).toStrictEqual({
      ...baseConfig,
      recordsPermissions: { objects: [] },
      permissionFlagUniversalIdentifiers: [],
    });
  });
});
