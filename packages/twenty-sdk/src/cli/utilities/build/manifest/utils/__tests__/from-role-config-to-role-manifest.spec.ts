import { fromRoleConfigToRoleManifest } from '@/cli/utilities/build/manifest/utils/from-role-config-to-role-manifest';
import { type RoleConfig } from '@/sdk/define/roles/role-config';
import {
  RowLevelPermissionPredicateGroupLogicalOperator,
  RowLevelPermissionPredicateOperand,
} from '@/sdk/define';
import {
  getFieldPermissionUniversalIdentifier,
  getObjectPermissionUniversalIdentifier,
} from 'twenty-shared/application';

const APPLICATION_UNIVERSAL_IDENTIFIER = '5a0c6f3e-8d2b-4c1a-9e7f-3b4d5c6e7f80';
const ROLE_UNIVERSAL_IDENTIFIER = 'c3c1dc2e-1a08-4de5-abb7-2139b3d99343';
const OBJECT_UNIVERSAL_IDENTIFIER = '39101b39-1c16-4148-9e82-45dc271bb90d';
const FIELD_UNIVERSAL_IDENTIFIER = '0e49f2e4-1e45-433d-bf49-79acc0b06d0e';
const PREDICATE_UNIVERSAL_IDENTIFIER = '22222222-0000-4000-8000-000000000000';
const GROUP_UNIVERSAL_IDENTIFIER = '11111111-0000-4000-8000-000000000000';
const OBJECT_PERMISSION_UNIVERSAL_IDENTIFIER =
  '33333333-0000-4000-8000-000000000000';
const FIELD_PERMISSION_UNIVERSAL_IDENTIFIER =
  '44444444-0000-4000-8000-000000000000';

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
  it('derives the universalIdentifier of object and field permissions that omit it', () => {
    const manifest = convert({
      ...baseConfig,
      objectPermissions: [
        {
          objectUniversalIdentifier: OBJECT_UNIVERSAL_IDENTIFIER,
          canReadObjectRecords: true,
        },
      ],
      fieldPermissions: [
        {
          objectUniversalIdentifier: OBJECT_UNIVERSAL_IDENTIFIER,
          fieldUniversalIdentifier: FIELD_UNIVERSAL_IDENTIFIER,
          canReadFieldValue: false,
        },
      ],
    });

    expect(manifest.objectPermissions?.[0]?.universalIdentifier).toBe(
      getObjectPermissionUniversalIdentifier({
        applicationUniversalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
        roleUniversalIdentifier: ROLE_UNIVERSAL_IDENTIFIER,
        objectUniversalIdentifier: OBJECT_UNIVERSAL_IDENTIFIER,
      }),
    );
    expect(manifest.fieldPermissions?.[0]?.universalIdentifier).toBe(
      getFieldPermissionUniversalIdentifier({
        applicationUniversalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
        roleUniversalIdentifier: ROLE_UNIVERSAL_IDENTIFIER,
        fieldUniversalIdentifier: FIELD_UNIVERSAL_IDENTIFIER,
      }),
    );
  });

  it('keeps the universalIdentifier an object or field permission provides', () => {
    const manifest = convert({
      ...baseConfig,
      objectPermissions: [
        {
          universalIdentifier: OBJECT_PERMISSION_UNIVERSAL_IDENTIFIER,
          objectUniversalIdentifier: OBJECT_UNIVERSAL_IDENTIFIER,
        },
      ],
      fieldPermissions: [
        {
          universalIdentifier: FIELD_PERMISSION_UNIVERSAL_IDENTIFIER,
          objectUniversalIdentifier: OBJECT_UNIVERSAL_IDENTIFIER,
          fieldUniversalIdentifier: FIELD_UNIVERSAL_IDENTIFIER,
        },
      ],
    });

    expect(manifest.objectPermissions?.[0]?.universalIdentifier).toBe(
      OBJECT_PERMISSION_UNIVERSAL_IDENTIFIER,
    );
    expect(manifest.fieldPermissions?.[0]?.universalIdentifier).toBe(
      FIELD_PERMISSION_UNIVERSAL_IDENTIFIER,
    );
  });

  it('passes predicates through with their explicit universalIdentifier', () => {
    const config: RoleConfig = {
      ...baseConfig,
      rowLevelPermissionPredicates: [
        {
          universalIdentifier: PREDICATE_UNIVERSAL_IDENTIFIER,
          objectUniversalIdentifier: OBJECT_UNIVERSAL_IDENTIFIER,
          fieldUniversalIdentifier: FIELD_UNIVERSAL_IDENTIFIER,
          operand: RowLevelPermissionPredicateOperand.IS,
        },
      ],
    };

    const manifest = convert(config);
    const predicate = manifest.rowLevelPermissionPredicates?.[0];

    expect(predicate?.universalIdentifier).toBe(PREDICATE_UNIVERSAL_IDENTIFIER);
    expect(predicate?.objectUniversalIdentifier).toBe(
      OBJECT_UNIVERSAL_IDENTIFIER,
    );
    expect(predicate?.fieldUniversalIdentifier).toBe(FIELD_UNIVERSAL_IDENTIFIER);
    expect(predicate?.operand).toBe(RowLevelPermissionPredicateOperand.IS);
  });

  it('passes predicate groups through with their explicit universalIdentifier', () => {
    const config: RoleConfig = {
      ...baseConfig,
      rowLevelPermissionPredicateGroups: [
        {
          universalIdentifier: GROUP_UNIVERSAL_IDENTIFIER,
          objectUniversalIdentifier: OBJECT_UNIVERSAL_IDENTIFIER,
          logicalOperator: RowLevelPermissionPredicateGroupLogicalOperator.OR,
        },
      ],
    };

    const manifest = convert(config);

    expect(manifest.rowLevelPermissionPredicateGroups).toHaveLength(1);
    expect(
      manifest.rowLevelPermissionPredicateGroups?.[0]?.universalIdentifier,
    ).toBe(GROUP_UNIVERSAL_IDENTIFIER);
  });

  it('defaults predicate collections to empty arrays', () => {
    const manifest = convert(baseConfig);

    expect(manifest.rowLevelPermissionPredicates).toEqual([]);
    expect(manifest.rowLevelPermissionPredicateGroups).toEqual([]);
  });
});
