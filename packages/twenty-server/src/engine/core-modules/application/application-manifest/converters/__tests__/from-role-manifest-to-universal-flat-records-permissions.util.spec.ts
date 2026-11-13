import {
  type RoleManifest,
  normalizeRoleManifestRecordsPermissions,
  type LegacyCompliantRoleManifest,
} from 'twenty-shared/application';
import {
  RowLevelPermissionPredicateGroupLogicalOperator,
  RowLevelPermissionPredicateOperand,
} from 'twenty-shared/types';

import { fromRoleManifestToUniversalFlatRecordsPermissionsOrThrow } from 'src/engine/core-modules/application/application-manifest/converters/from-role-manifest-to-universal-flat-records-permissions.util';

const APPLICATION = '20202020-0000-4000-8000-000000000001';
const NOW = '2026-11-12T00:00:00.000Z';

const PREDICATE = {
  fieldUniversalIdentifier: 'owner',
  operand: RowLevelPermissionPredicateOperand.IS,
};

const ROLE = { universalIdentifier: 'role', label: 'Role' };

const convert = ({
  recordsPermissions,
}: Pick<RoleManifest, 'recordsPermissions'>) =>
  fromRoleManifestToUniversalFlatRecordsPermissionsOrThrow({
    roleManifest: { ...ROLE, recordsPermissions },
    applicationUniversalIdentifier: APPLICATION,
    now: NOW,
  });

const convertDeprecated = (
  roleManifest: Omit<
    LegacyCompliantRoleManifest,
    'universalIdentifier' | 'label'
  >,
) =>
  convert(
    normalizeRoleManifestRecordsPermissions({
      role: { ...ROLE, ...roleManifest },
      applicationUniversalIdentifier: APPLICATION,
    }),
  );

describe('fromRoleManifestToUniversalFlatRecordsPermissionsOrThrow', () => {
  it('should write the all records permissions, field restrictions and rules of an object', () => {
    const {
      objectPermissions,
      fieldPermissions,
      rules,
      predicateGroups,
      predicates,
    } = convert({
      recordsPermissions: {
        objects: [
          {
            objectUniversalIdentifier: 'company',
            canReadAllRecords: false,
            canUpdateAllRecords: true,
            unreadableFields: ['secret'],
            uneditableFields: ['secret', 'revenue'],
            rowLevelRecordsPermissions: [
              {
                universalIdentifier: 'rule',
                canReadRecords: true,
                uneditableFields: ['name'],
                predicates: [
                  { ...PREDICATE, universalIdentifier: 'predicate' },
                ],
                predicateGroups: [
                  {
                    universalIdentifier: 'group',
                    logicalOperator:
                      RowLevelPermissionPredicateGroupLogicalOperator.OR,
                    predicates: [
                      {
                        ...PREDICATE,
                        universalIdentifier: 'predicate-in-group',
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
    });

    expect(objectPermissions).toMatchObject([
      {
        objectMetadataUniversalIdentifier: 'company',
        canReadObjectRecords: false,
        canCreateObjectRecords: true,
        canUpdateObjectRecords: true,
        canSoftDeleteObjectRecords: null,
      },
    ]);
    expect(fieldPermissions).toMatchObject([
      {
        fieldMetadataUniversalIdentifier: 'secret',
        canReadFieldValue: false,
        canUpdateFieldValue: false,
        rowLevelPermissionRuleUniversalIdentifier: null,
      },
      {
        fieldMetadataUniversalIdentifier: 'revenue',
        canReadFieldValue: null,
        canUpdateFieldValue: false,
        rowLevelPermissionRuleUniversalIdentifier: null,
      },
      {
        fieldMetadataUniversalIdentifier: 'name',
        canUpdateFieldValue: false,
        rowLevelPermissionRuleUniversalIdentifier: 'rule',
        rowLevelPermissionPredicateGroupUniversalIdentifier: 'group',
      },
    ]);
    expect(rules).toMatchObject([
      {
        universalIdentifier: 'rule',
        objectMetadataUniversalIdentifier: 'company',
        canReadRecords: true,
      },
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
        rowLevelPermissionRuleUniversalIdentifier: 'rule',
        rowLevelPermissionPredicateGroupUniversalIdentifier: null,
      },
      {
        universalIdentifier: 'predicate-in-group',
        rowLevelPermissionRuleUniversalIdentifier: 'rule',
        rowLevelPermissionPredicateGroupUniversalIdentifier: 'group',
      },
    ]);
  });

  it('should write no object permission for an object that only declares rules', () => {
    const { objectPermissions, rules } = convert({
      recordsPermissions: {
        objects: [
          {
            objectUniversalIdentifier: 'company',
            rowLevelRecordsPermissions: [
              {
                universalIdentifier: 'rule',
                canReadRecords: true,
                predicates: [
                  { ...PREDICATE, universalIdentifier: 'predicate' },
                ],
              },
            ],
          },
        ],
      },
    });

    expect(rules).toHaveLength(1);
    expect(objectPermissions).toEqual([]);
  });

  it('should convert the deprecated properties before writing them', () => {
    const { objectPermissions, fieldPermissions, rules, predicates } =
      convertDeprecated({
        objectPermissions: [
          {
            objectUniversalIdentifier: 'company',
            canReadObjectRecords: true,
            canUpdateObjectRecords: true,
          },
        ],
        fieldPermissions: [
          {
            objectUniversalIdentifier: 'company',
            fieldUniversalIdentifier: 'secret',
            canReadFieldValue: false,
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

    expect(rules).toMatchObject([
      {
        canReadRecords: true,
        canCreateRecords: true,
        canUpdateRecords: true,
        canSoftDeleteRecords: false,
        canDestroyRecords: false,
      },
    ]);
    expect(predicates[0].rowLevelPermissionRuleUniversalIdentifier).toBe(
      rules[0].universalIdentifier,
    );
    expect(objectPermissions).toMatchObject([
      {
        objectMetadataUniversalIdentifier: 'company',
        canReadObjectRecords: false,
        canCreateObjectRecords: false,
        canUpdateObjectRecords: false,
        canSoftDeleteObjectRecords: false,
        canDestroyObjectRecords: false,
      },
    ]);
    expect(fieldPermissions).toMatchObject([
      { fieldMetadataUniversalIdentifier: 'secret', canReadFieldValue: false },
    ]);
  });

  it('should refuse field restrictions on a rule that has no predicate group to hold them', () => {
    expect(() =>
      convert({
        recordsPermissions: {
          objects: [
            {
              objectUniversalIdentifier: 'company',
              rowLevelRecordsPermissions: [
                {
                  universalIdentifier: 'rule',
                  unreadableFields: ['secret'],
                  predicates: [
                    { ...PREDICATE, universalIdentifier: 'predicate' },
                  ],
                },
              ],
            },
          ],
        },
      }),
    ).toThrow('no predicate group to hold them');
  });
});
