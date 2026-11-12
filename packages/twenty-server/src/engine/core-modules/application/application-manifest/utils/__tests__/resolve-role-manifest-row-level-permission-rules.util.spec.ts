import {
  getRowLevelPermissionRuleUniversalIdentifier,
  type RoleManifest,
} from 'twenty-shared/application';
import {
  RowLevelPermissionPredicateGroupLogicalOperator,
  RowLevelPermissionPredicateOperand,
} from 'twenty-shared/types';

import { fromObjectPermissionManifestToUniversalFlatObjectPermission } from 'src/engine/core-modules/application/application-manifest/converters/from-object-permission-manifest-to-universal-flat-object-permission.util';
import { fromRoleManifestToUniversalFlatRole } from 'src/engine/core-modules/application/application-manifest/converters/from-role-manifest-to-universal-flat-role.util';
import { fromRowLevelPermissionPredicateGroupManifestToUniversalFlatRowLevelPermissionPredicateGroup } from 'src/engine/core-modules/application/application-manifest/converters/from-row-level-permission-predicate-group-manifest-to-universal-flat-row-level-permission-predicate-group.util';
import { fromRowLevelPermissionPredicateManifestToUniversalFlatRowLevelPermissionPredicate } from 'src/engine/core-modules/application/application-manifest/converters/from-row-level-permission-predicate-manifest-to-universal-flat-row-level-permission-predicate.util';
import { fromRowLevelPermissionRuleManifestToUniversalFlatRowLevelPermissionRule } from 'src/engine/core-modules/application/application-manifest/converters/from-row-level-permission-rule-manifest-to-universal-flat-row-level-permission-rule.util';
import { resolveRoleManifestRowLevelPermissionRules } from 'src/engine/core-modules/application/application-manifest/utils/resolve-role-manifest-row-level-permission-rules.util';

const APPLICATION = '20202020-0000-4000-8000-000000000001';
const ROLE = '20202020-0000-4000-8000-000000000002';
const NOW = '2026-11-12T00:00:00.000Z';
const OWNER = {
  roleUniversalIdentifier: ROLE,
  applicationUniversalIdentifier: APPLICATION,
  now: NOW,
};

const buildPredicateManifest = ({
  universalIdentifier,
  objectUniversalIdentifier = 'company',
  ...rest
}: {
  universalIdentifier: string;
  objectUniversalIdentifier?: string;
  predicateGroupUniversalIdentifier?: string;
  rowLevelPermissionRuleUniversalIdentifier?: string;
}) => ({
  universalIdentifier,
  objectUniversalIdentifier,
  fieldUniversalIdentifier: 'owner',
  operand: RowLevelPermissionPredicateOperand.IS,
  ...rest,
});

const resolve = (
  roleManifest: Omit<RoleManifest, 'universalIdentifier' | 'label'>,
) =>
  resolveRoleManifestRowLevelPermissionRules({
    universalFlatRole: fromRoleManifestToUniversalFlatRole({
      roleManifest: {
        universalIdentifier: ROLE,
        label: 'Role',
        ...roleManifest,
      },
      applicationUniversalIdentifier: APPLICATION,
      now: NOW,
    }),
    universalFlatObjectPermissions: (roleManifest.objectPermissions ?? []).map(
      (objectPermissionManifest) =>
        fromObjectPermissionManifestToUniversalFlatObjectPermission({
          objectPermissionManifest,
          ...OWNER,
        }),
    ),
    declaredRules: (roleManifest.rowLevelPermissionRules ?? []).map(
      (rowLevelPermissionRuleManifest) =>
        fromRowLevelPermissionRuleManifestToUniversalFlatRowLevelPermissionRule(
          { rowLevelPermissionRuleManifest, ...OWNER },
        ),
    ),
    predicateGroups: (roleManifest.rowLevelPermissionPredicateGroups ?? []).map(
      (rowLevelPermissionPredicateGroupManifest) =>
        fromRowLevelPermissionPredicateGroupManifestToUniversalFlatRowLevelPermissionPredicateGroup(
          { rowLevelPermissionPredicateGroupManifest, ...OWNER },
        ),
    ),
    predicates: (roleManifest.rowLevelPermissionPredicates ?? []).map(
      (rowLevelPermissionPredicateManifest) =>
        fromRowLevelPermissionPredicateManifestToUniversalFlatRowLevelPermissionPredicate(
          { rowLevelPermissionPredicateManifest, ...OWNER },
        ),
    ),
    now: NOW,
  });

const NO_OBJECT_RECORDS_GRANTS = {
  canReadObjectRecords: false,
  canCreateObjectRecords: false,
  canUpdateObjectRecords: false,
  canSoftDeleteObjectRecords: false,
  canDestroyObjectRecords: false,
};

describe('resolveRoleManifestRowLevelPermissionRules', () => {
  it('should move the object permission of a manifest without rules onto the derived rule', () => {
    const { rules, predicates, objectPermissions } = resolve({
      objectPermissions: [
        {
          objectUniversalIdentifier: 'company',
          canReadObjectRecords: true,
          canUpdateObjectRecords: true,
        },
      ],
      rowLevelPermissionPredicates: [
        buildPredicateManifest({ universalIdentifier: 'predicate' }),
      ],
    });

    const derivedRuleUniversalIdentifier =
      getRowLevelPermissionRuleUniversalIdentifier({
        applicationUniversalIdentifier: APPLICATION,
        roleUniversalIdentifier: ROLE,
        objectMetadataUniversalIdentifier: 'company',
        rootRowLevelPermissionPredicateGroupUniversalIdentifier: null,
      });

    expect(rules).toMatchObject([
      {
        universalIdentifier: derivedRuleUniversalIdentifier,
        canReadRecords: true,
        canCreateRecords: true,
        canUpdateRecords: true,
        canSoftDeleteRecords: false,
        canDestroyRecords: false,
      },
    ]);
    expect(predicates[0].rowLevelPermissionRuleUniversalIdentifier).toBe(
      derivedRuleUniversalIdentifier,
    );
    expect(objectPermissions).toMatchObject([
      {
        objectMetadataUniversalIdentifier: 'company',
        ...NO_OBJECT_RECORDS_GRANTS,
      },
    ]);
  });

  it('should take the role grants and add an object permission when a manifest without rules declares none', () => {
    const { rules, objectPermissions } = resolve({
      canReadAllObjectRecords: true,
      rowLevelPermissionPredicates: [
        buildPredicateManifest({ universalIdentifier: 'predicate' }),
      ],
    });

    expect(rules).toMatchObject([
      { canReadRecords: true, canUpdateRecords: false },
    ]);
    expect(objectPermissions).toMatchObject([
      {
        objectMetadataUniversalIdentifier: 'company',
        roleUniversalIdentifier: ROLE,
        ...NO_OBJECT_RECORDS_GRANTS,
      },
    ]);
  });

  it('should keep declared rules and object permissions as written and link nested entities to the rule of their root group', () => {
    const { rules, predicateGroups, predicates, objectPermissions } = resolve({
      objectPermissions: [
        { objectUniversalIdentifier: 'company', canReadObjectRecords: false },
      ],
      rowLevelPermissionRules: [
        {
          universalIdentifier: 'rule',
          objectUniversalIdentifier: 'company',
          canReadRecords: true,
        },
      ],
      rowLevelPermissionPredicateGroups: [
        {
          universalIdentifier: 'root',
          objectUniversalIdentifier: 'company',
          logicalOperator: RowLevelPermissionPredicateGroupLogicalOperator.AND,
          rowLevelPermissionRuleUniversalIdentifier: 'rule',
        },
        {
          universalIdentifier: 'nested',
          objectUniversalIdentifier: 'company',
          logicalOperator: RowLevelPermissionPredicateGroupLogicalOperator.OR,
          parentPredicateGroupUniversalIdentifier: 'root',
        },
      ],
      rowLevelPermissionPredicates: [
        buildPredicateManifest({
          universalIdentifier: 'predicate-in-nested',
          predicateGroupUniversalIdentifier: 'nested',
        }),
        buildPredicateManifest({
          universalIdentifier: 'ungrouped-predicate',
          rowLevelPermissionRuleUniversalIdentifier: 'rule',
        }),
      ],
    });

    expect(rules).toMatchObject([
      { universalIdentifier: 'rule', canReadRecords: true },
    ]);
    expect(
      [...predicateGroups, ...predicates].map(
        ({ rowLevelPermissionRuleUniversalIdentifier }) =>
          rowLevelPermissionRuleUniversalIdentifier,
      ),
    ).toEqual(['rule', 'rule', 'rule', 'rule']);
    expect(objectPermissions).toMatchObject([
      { canReadObjectRecords: false, canUpdateObjectRecords: null },
    ]);
  });

  it('should only fall back on the objects whose predicates sit outside a rule', () => {
    const { rules, objectPermissions } = resolve({
      objectPermissions: [
        { objectUniversalIdentifier: 'company', canReadObjectRecords: true },
        { objectUniversalIdentifier: 'person', canReadObjectRecords: true },
      ],
      rowLevelPermissionRules: [
        {
          universalIdentifier: 'company-rule',
          objectUniversalIdentifier: 'company',
          canUpdateRecords: true,
        },
      ],
      rowLevelPermissionPredicates: [
        buildPredicateManifest({
          universalIdentifier: 'company-predicate',
          rowLevelPermissionRuleUniversalIdentifier: 'company-rule',
        }),
        buildPredicateManifest({
          universalIdentifier: 'person-predicate',
          objectUniversalIdentifier: 'person',
        }),
      ],
    });

    expect(rules).toMatchObject([
      {
        universalIdentifier: 'company-rule',
        canReadRecords: false,
        canUpdateRecords: true,
      },
      { objectMetadataUniversalIdentifier: 'person', canReadRecords: true },
    ]);
    expect(objectPermissions).toMatchObject([
      {
        objectMetadataUniversalIdentifier: 'company',
        canReadObjectRecords: true,
      },
      {
        objectMetadataUniversalIdentifier: 'person',
        ...NO_OBJECT_RECORDS_GRANTS,
      },
    ]);
  });
});
