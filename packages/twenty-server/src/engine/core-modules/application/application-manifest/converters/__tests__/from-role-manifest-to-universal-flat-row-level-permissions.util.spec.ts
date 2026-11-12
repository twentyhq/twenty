import {
  getRowLevelPermissionRuleUniversalIdentifier,
  type RoleManifest,
} from 'twenty-shared/application';
import {
  RowLevelPermissionPredicateGroupLogicalOperator,
  RowLevelPermissionPredicateOperand,
} from 'twenty-shared/types';

import { fromRoleManifestToUniversalFlatRole } from 'src/engine/core-modules/application/application-manifest/converters/from-role-manifest-to-universal-flat-role.util';
import { fromRoleManifestToUniversalFlatRowLevelPermissions } from 'src/engine/core-modules/application/application-manifest/converters/from-role-manifest-to-universal-flat-row-level-permissions.util';

const APPLICATION = '20202020-0000-4000-8000-000000000001';
const ROLE = '20202020-0000-4000-8000-000000000002';
const NOW = '2026-11-12T00:00:00.000Z';

const PREDICATE = {
  fieldUniversalIdentifier: 'owner',
  operand: RowLevelPermissionPredicateOperand.IS,
};

const convert = (
  roleManifest: Omit<RoleManifest, 'universalIdentifier' | 'label'>,
) =>
  fromRoleManifestToUniversalFlatRowLevelPermissions({
    roleManifest,
    universalFlatRole: fromRoleManifestToUniversalFlatRole({
      roleManifest: {
        universalIdentifier: ROLE,
        label: 'Role',
        ...roleManifest,
      },
      applicationUniversalIdentifier: APPLICATION,
      now: NOW,
    }),
    now: NOW,
  });

const NO_OBJECT_RECORDS_GRANTS = {
  canReadObjectRecords: false,
  canCreateObjectRecords: false,
  canUpdateObjectRecords: false,
  canSoftDeleteObjectRecords: false,
  canDestroyObjectRecords: false,
};

describe('fromRoleManifestToUniversalFlatRowLevelPermissions', () => {
  it('should move the object permission onto the derived rule of predicates declared outside a rule', () => {
    const { rules, predicates, objectPermissions } = convert({
      objectPermissions: [
        {
          objectUniversalIdentifier: 'company',
          canReadObjectRecords: true,
          canUpdateObjectRecords: true,
        },
      ],
      rowLevelPermissionPredicates: [
        {
          ...PREDICATE,
          universalIdentifier: 'predicate',
          objectUniversalIdentifier: 'company',
        },
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

  it('should take the role grants and add an object permission when predicates declared outside a rule have none', () => {
    const { rules, objectPermissions } = convert({
      canReadAllObjectRecords: true,
      rowLevelPermissionPredicates: [
        {
          ...PREDICATE,
          universalIdentifier: 'predicate',
          objectUniversalIdentifier: 'company',
        },
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

  it('should write a rule with the predicates and groups nested in it and leave the object permission as declared', () => {
    const { rules, predicateGroups, predicates, objectPermissions } = convert({
      objectPermissions: [
        { objectUniversalIdentifier: 'company', canReadObjectRecords: false },
      ],
      rowLevelPermissionRules: [
        {
          universalIdentifier: 'rule',
          objectUniversalIdentifier: 'company',
          canReadRecords: true,
          predicates: [{ ...PREDICATE, universalIdentifier: 'predicate' }],
          predicateGroups: [
            {
              universalIdentifier: 'group',
              logicalOperator:
                RowLevelPermissionPredicateGroupLogicalOperator.OR,
              predicates: [
                { ...PREDICATE, universalIdentifier: 'predicate-in-group' },
              ],
            },
          ],
        },
      ],
    });

    expect(rules).toMatchObject([
      { universalIdentifier: 'rule', canReadRecords: true },
    ]);
    expect(predicateGroups).toMatchObject([
      {
        universalIdentifier: 'group',
        objectMetadataUniversalIdentifier: 'company',
        rowLevelPermissionRuleUniversalIdentifier: 'rule',
        parentRowLevelPermissionPredicateGroupUniversalIdentifier: null,
      },
    ]);
    expect(predicates).toMatchObject([
      {
        universalIdentifier: 'predicate',
        objectMetadataUniversalIdentifier: 'company',
        rowLevelPermissionRuleUniversalIdentifier: 'rule',
        rowLevelPermissionPredicateGroupUniversalIdentifier: null,
      },
      {
        universalIdentifier: 'predicate-in-group',
        rowLevelPermissionRuleUniversalIdentifier: 'rule',
        rowLevelPermissionPredicateGroupUniversalIdentifier: 'group',
      },
    ]);
    expect(objectPermissions).toMatchObject([
      { canReadObjectRecords: false, canUpdateObjectRecords: null },
    ]);
  });

  it('should only fall back on the objects whose predicates sit outside a rule', () => {
    const { rules, objectPermissions } = convert({
      objectPermissions: [
        { objectUniversalIdentifier: 'company', canReadObjectRecords: true },
        { objectUniversalIdentifier: 'person', canReadObjectRecords: true },
      ],
      rowLevelPermissionRules: [
        {
          universalIdentifier: 'company-rule',
          objectUniversalIdentifier: 'company',
          canUpdateRecords: true,
          predicates: [
            { ...PREDICATE, universalIdentifier: 'company-predicate' },
          ],
        },
      ],
      rowLevelPermissionPredicates: [
        {
          ...PREDICATE,
          universalIdentifier: 'person-predicate',
          objectUniversalIdentifier: 'person',
        },
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
