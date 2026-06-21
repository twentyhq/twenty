import { fromRoleConfigToRoleManifest } from '@/cli/utilities/build/manifest/utils/from-role-config-to-role-manifest';
import { type RoleConfig } from '@/sdk/define/roles/role-config';
import {
  RowLevelPermissionPredicateGroupLogicalOperator,
  RowLevelPermissionPredicateOperand,
} from '@/sdk/define';

const ROLE_UNIVERSAL_IDENTIFIER = 'c3c1dc2e-1a08-4de5-abb7-2139b3d99343';
const OBJECT_UNIVERSAL_IDENTIFIER = '39101b39-1c16-4148-9e82-45dc271bb90d';
const FIELD_UNIVERSAL_IDENTIFIER = '0e49f2e4-1e45-433d-bf49-79acc0b06d0e';
const WORKSPACE_MEMBER_FIELD_UNIVERSAL_IDENTIFIER =
  '20202020-0d83-4a9b-8e3a-0a2a4f1f8f1a';

const baseConfig: RoleConfig = {
  universalIdentifier: ROLE_UNIVERSAL_IDENTIFIER,
  label: 'Partner',
};

describe('fromRoleConfigToRoleManifest', () => {
  it('derives a deterministic universalIdentifier for predicates', () => {
    const config: RoleConfig = {
      ...baseConfig,
      rowLevelPermissionPredicates: [
        {
          objectUniversalIdentifier: OBJECT_UNIVERSAL_IDENTIFIER,
          fieldUniversalIdentifier: FIELD_UNIVERSAL_IDENTIFIER,
          operand: RowLevelPermissionPredicateOperand.IS,
          workspaceMemberFieldUniversalIdentifier:
            WORKSPACE_MEMBER_FIELD_UNIVERSAL_IDENTIFIER,
        },
      ],
    };

    const first = fromRoleConfigToRoleManifest(config);
    const second = fromRoleConfigToRoleManifest(config);

    const firstPredicate = first.rowLevelPermissionPredicates?.[0];
    const secondPredicate = second.rowLevelPermissionPredicates?.[0];

    expect(firstPredicate?.universalIdentifier).toBeDefined();
    expect(firstPredicate?.universalIdentifier).toBe(
      secondPredicate?.universalIdentifier,
    );
    expect(firstPredicate?.objectUniversalIdentifier).toBe(
      OBJECT_UNIVERSAL_IDENTIFIER,
    );
    expect(firstPredicate?.fieldUniversalIdentifier).toBe(
      FIELD_UNIVERSAL_IDENTIFIER,
    );
    expect(firstPredicate?.operand).toBe(RowLevelPermissionPredicateOperand.IS);
    expect(firstPredicate?.workspaceMemberFieldUniversalIdentifier).toBe(
      WORKSPACE_MEMBER_FIELD_UNIVERSAL_IDENTIFIER,
    );
  });

  it('derives distinct identifiers for predicates differing only by operand', () => {
    const config: RoleConfig = {
      ...baseConfig,
      rowLevelPermissionPredicates: [
        {
          objectUniversalIdentifier: OBJECT_UNIVERSAL_IDENTIFIER,
          fieldUniversalIdentifier: FIELD_UNIVERSAL_IDENTIFIER,
          operand: RowLevelPermissionPredicateOperand.IS,
        },
        {
          objectUniversalIdentifier: OBJECT_UNIVERSAL_IDENTIFIER,
          fieldUniversalIdentifier: FIELD_UNIVERSAL_IDENTIFIER,
          operand: RowLevelPermissionPredicateOperand.IS_NOT,
        },
      ],
    };

    const manifest = fromRoleConfigToRoleManifest(config);
    const identifiers = (manifest.rowLevelPermissionPredicates ?? []).map(
      (predicate) => predicate.universalIdentifier,
    );

    expect(new Set(identifiers).size).toBe(2);
  });

  it('derives distinct identifiers for predicates differing only by workspace member field or sub-field', () => {
    const config: RoleConfig = {
      ...baseConfig,
      rowLevelPermissionPredicates: [
        {
          objectUniversalIdentifier: OBJECT_UNIVERSAL_IDENTIFIER,
          fieldUniversalIdentifier: FIELD_UNIVERSAL_IDENTIFIER,
          operand: RowLevelPermissionPredicateOperand.IS,
          workspaceMemberFieldUniversalIdentifier:
            '20202020-0d83-4a9b-8e3a-0a2a4f1f8f1a',
        },
        {
          objectUniversalIdentifier: OBJECT_UNIVERSAL_IDENTIFIER,
          fieldUniversalIdentifier: FIELD_UNIVERSAL_IDENTIFIER,
          operand: RowLevelPermissionPredicateOperand.IS,
          workspaceMemberFieldUniversalIdentifier:
            '30303030-0d83-4a9b-8e3a-0a2a4f1f8f1a',
        },
        {
          objectUniversalIdentifier: OBJECT_UNIVERSAL_IDENTIFIER,
          fieldUniversalIdentifier: FIELD_UNIVERSAL_IDENTIFIER,
          operand: RowLevelPermissionPredicateOperand.IS,
          subFieldName: 'firstName',
        },
        {
          objectUniversalIdentifier: OBJECT_UNIVERSAL_IDENTIFIER,
          fieldUniversalIdentifier: FIELD_UNIVERSAL_IDENTIFIER,
          operand: RowLevelPermissionPredicateOperand.IS,
          subFieldName: 'lastName',
        },
      ],
    };

    const manifest = fromRoleConfigToRoleManifest(config);
    const identifiers = (manifest.rowLevelPermissionPredicates ?? []).map(
      (predicate) => predicate.universalIdentifier,
    );

    expect(new Set(identifiers).size).toBe(4);
  });

  it('derives the same identifier regardless of value object key order', () => {
    const makeConfig = (value: Record<string, unknown>): RoleConfig => ({
      ...baseConfig,
      rowLevelPermissionPredicates: [
        {
          objectUniversalIdentifier: OBJECT_UNIVERSAL_IDENTIFIER,
          fieldUniversalIdentifier: FIELD_UNIVERSAL_IDENTIFIER,
          operand: RowLevelPermissionPredicateOperand.CONTAINS,
          value,
        },
      ],
    });

    const first = fromRoleConfigToRoleManifest(
      makeConfig({ isCurrentWorkspaceMemberSelected: true, selectedRecordIds: ['a', 'b'] }),
    );
    const second = fromRoleConfigToRoleManifest(
      makeConfig({ selectedRecordIds: ['a', 'b'], isCurrentWorkspaceMemberSelected: true }),
    );

    expect(
      first.rowLevelPermissionPredicates?.[0]?.universalIdentifier,
    ).toBe(second.rowLevelPermissionPredicates?.[0]?.universalIdentifier);
  });

  it('passes predicate groups through with their explicit universalIdentifier', () => {
    const groupUniversalIdentifier = '11111111-0000-4000-8000-000000000000';

    const config: RoleConfig = {
      ...baseConfig,
      rowLevelPermissionPredicateGroups: [
        {
          universalIdentifier: groupUniversalIdentifier,
          objectUniversalIdentifier: OBJECT_UNIVERSAL_IDENTIFIER,
          logicalOperator: RowLevelPermissionPredicateGroupLogicalOperator.OR,
        },
      ],
    };

    const manifest = fromRoleConfigToRoleManifest(config);

    expect(manifest.rowLevelPermissionPredicateGroups).toHaveLength(1);
    expect(
      manifest.rowLevelPermissionPredicateGroups?.[0]?.universalIdentifier,
    ).toBe(groupUniversalIdentifier);
  });

  it('defaults predicate collections to empty arrays', () => {
    const manifest = fromRoleConfigToRoleManifest(baseConfig);

    expect(manifest.rowLevelPermissionPredicates).toEqual([]);
    expect(manifest.rowLevelPermissionPredicateGroups).toEqual([]);
  });
});
